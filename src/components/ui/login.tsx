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
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }).optional(),
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
  forgotPasswordHref: string;
  createAccountHref: string;
  toggleModeHref: string;
}

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
  forgotPasswordHref,
  createAccountHref,
  toggleModeHref,
}: AuthFormSplitScreenProps) {
  const [isLoading, setIsLoading] = React.useState(false);

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
