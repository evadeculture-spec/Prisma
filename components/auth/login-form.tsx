"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Eye, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { demoSignInAction, signInAction, signUpAction, type AuthActionState } from "@/lib/actions/auth";

const INITIAL_STATE: AuthActionState = {};

export function LoginForm({ next }: { next: string }) {
  const [signInState, signInFormAction, isSigningIn] = useActionState(signInAction, INITIAL_STATE);
  const [signUpState, signUpFormAction, isSigningUp] = useActionState(signUpAction, INITIAL_STATE);
  const [demoState, demoFormAction, isDemoLoading] = useActionState(demoSignInAction, INITIAL_STATE);

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center lg:text-left">
        <h2 className="font-display text-2xl font-semibold text-foreground">Bem-vindo de volta</h2>
        <p className="text-sm text-muted-foreground">Entre na sua conta para continuar.</p>
      </div>

      <div className="space-y-3">
        <form action={demoFormAction} className="space-y-1.5">
          <Button type="submit" variant="gold" className="w-full" disabled={isDemoLoading}>
            {isDemoLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Experimentar sem criar conta
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Acesso completo · Dados eliminados automaticamente ao sair
          </p>
          {demoState.error && <p className="text-center text-sm text-destructive">{demoState.error}</p>}
        </form>

        <Button variant="outline" className="w-full" asChild>
          <Link href="/preview">
            <Eye className="size-4" />
            Ver visão geral (sem sessão)
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">ou com a sua conta</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Tabs defaultValue="signin">
        <TabsList className="w-full">
          <TabsTrigger value="signin" className="flex-1">
            Entrar
          </TabsTrigger>
          <TabsTrigger value="signup" className="flex-1">
            Criar conta
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="space-y-4 pt-4">
          <form action={signInFormAction} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <div className="space-y-1.5">
              <Label htmlFor="signin-email">Email</Label>
              <Input id="signin-email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signin-password">Palavra-passe</Label>
              <Input id="signin-password" name="password" type="password" autoComplete="current-password" required />
            </div>
            {signInState.error && <p className="text-sm text-destructive">{signInState.error}</p>}
            <Button type="submit" className="w-full" disabled={isSigningIn}>
              {isSigningIn && <Loader2 className="size-4 animate-spin" />}
              Entrar
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="space-y-4 pt-4">
          <form action={signUpFormAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="signup-name">Nome completo</Label>
              <Input id="signup-name" name="full_name" autoComplete="name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signup-password">Palavra-passe</Label>
              <Input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>
            {signUpState.error && <p className="text-sm text-destructive">{signUpState.error}</p>}
            {signUpState.info && <p className="text-sm text-emerald-600">{signUpState.info}</p>}
            <Button type="submit" className="w-full" disabled={isSigningUp}>
              {isSigningUp && <Loader2 className="size-4 animate-spin" />}
              Criar conta e agência
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
