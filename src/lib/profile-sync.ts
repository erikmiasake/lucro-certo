import { supabase } from '@/integrations/supabase/client';
import { AppState, BusinessProfile, CostMapItem, Goals } from '@/lib/store';

export async function loadProfileFromDB(): Promise<Partial<AppState> | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    businessType: data.business_type as AppState['businessType'],
    onboardingComplete: data.onboarding_complete,
    businessProfile: {
      name: data.business_name || '',
      city: data.city || '',
      operatingDays: data.operating_days || 6,
      employeeCount: data.employee_count || 0,
      objective: (data.objective || '') as BusinessProfile['objective'],
      operatingWeekdays: [1, 2, 3, 4, 5, 6],
    },
    averageSales: data.average_sales ? Number(data.average_sales) : undefined,
    mainCosts: data.main_costs || [],
    costMap: (data.cost_map as unknown as CostMapItem[]) || [],
    goals: (data.goals as unknown as Goals) || { monthlyProfit: null, monthlyMargin: null },
  };
}

export async function saveProfileToDB(state: AppState): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .upsert({
      user_id: user.id,
      business_type: state.businessType,
      onboarding_complete: state.onboardingComplete,
      business_name: state.businessProfile.name,
      city: state.businessProfile.city,
      operating_days: state.businessProfile.operatingDays,
      employee_count: state.businessProfile.employeeCount,
      objective: state.businessProfile.objective,
      average_sales: state.averageSales || null,
      main_costs: state.mainCosts || [],
      cost_map: state.costMap as any,
      goals: state.goals as any,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) {
    console.error('Error saving profile to DB:', error);
  }
}
