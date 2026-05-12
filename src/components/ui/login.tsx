"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

// Validation schema for the form
const formSchema = z.object({
  name: z.string().optional().refine((val) => !val || val.length >= 2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z
    .string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres." }),
  rememberMe: z.boolean().default(false).optional(),
});

export type FormValues = z.infer<typeof formSchema>;

interface AuthFormSplitScreenProps {
  mode?: 'login' | 'register';
  logo: React.ReactNode;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  onSubmit: (data: FormValues) => Promise<void>;
  onGoogleSignIn?: () => Promise<void>;
  forgotPasswordHref: string;
  createAccountHref: string;
  toggleModeHref: string;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

/**
 * A responsive, split-screen authentication form component.
 */
export function AuthFormSplitScreen({
  mode = 'login',
  logo,
  title,
  description,
  imageSrc,
  imageAlt,
  onSubmit,
  onGoogleSignIn,
  forgotPasswordHref,
  createAccountHref,
  toggleModeHref,
}: AuthFormSplitScreenProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const handleGoogleClick = async () => {
    if (!onGoogleSignIn) return;
    setIsGoogleLoading(true);
    try {
      await onGoogleSignIn();
    } catch (error) {
      console.error("Google sign-in failed:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const handleFormSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants for staggering children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col md:flex-row bg-[#0A0A0B]">
      {/* Left Panel: Form */}
      <div className="flex w-full flex-col items-center justify-center bg-background p-8 md:w-1/2">
        <div className="w-full max-w-md">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            <motion.div variants={itemVariants} className="mb-4">
              {logo}
            </motion.div>
            <motion.div variants={itemVariants} className="text-left">
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{title}</h1>
              <p className="text-muted-foreground">{description}</p>
            </motion.div>

            {onGoogleSignIn && (
              <>
                <motion.div variants={itemVariants}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleClick}
                    disabled={isLoading || isGoogleLoading}
                    className="w-full h-12 gap-3 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white font-semibold"
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <GoogleIcon />
                    )}
                    {mode === 'login' ? 'Continuar com Google' : 'Cadastrar com Google'}
                  </Button>
                </motion.div>
                <motion.div variants={itemVariants} className="relative my-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-3 text-xs uppercase tracking-widest text-muted-foreground/70">
                      ou com e-mail
                    </span>
                  </div>
                </motion.div>
              </>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-4"
              >
                {mode === 'register' && (
                  <motion.div variants={itemVariants}>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Seu nome"
                              className="h-12 bg-black/20 border-white/10"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="seu@email.com"
                            className="h-12 bg-black/20 border-white/10"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••••••"
                            className="h-12 bg-black/20 border-white/10"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-between"
                >
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal text-muted-foreground cursor-pointer">
                          Lembrar de mim
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <Link
                    to={forgotPasswordHref}
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button type="submit" className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(20,184,105,0.2)]" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {mode === 'login' ? 'Entrar na plataforma' : 'Criar minha conta'}
                  </Button>
                </motion.div>
              </form>
            </Form>

            <motion.p
              variants={itemVariants}
              className="text-center text-[15px] text-muted-foreground mt-2"
            >
              {mode === 'login' ? (
                <>
                  Não possui uma conta?{" "}
                  <Link
                    to={toggleModeHref}
                    className="font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Cadastre-se aqui
                  </Link>
                </>
              ) : (
                <>
                  Já possui uma conta?{" "}
                  <Link
                    to={toggleModeHref}
                    className="font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Faça login
                  </Link>
                </>
              )}
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel: Image */}
      <div className="relative hidden w-1/2 md:block overflow-hidden">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-full w-full object-cover grayscale opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B] to-transparent opacity-40" />
        
        {/* Optional Overlay Text for Premium Feel */}
        <div className="absolute bottom-12 left-12 right-12 z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Domine seu lucro real. <br />
              Tome decisões baseadas em dados.
            </h2>
            <div className="w-20 h-1 bg-primary rounded-full" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
