import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/Icons";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const signInSchema = z.object({
  email: z.string().email({ message: "Adresse e-mail invalide" }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
});

const signUpSchema = z.object({
  email: z.string().email({ message: "Adresse e-mail invalide" }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),
  lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
});

type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

const Auth = () => {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const handleSignIn = async (data: SignInFormValues) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);
    if (error) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  const handleSignUp = async (data: SignUpFormValues) => {
    setIsLoading(true);
    const { error } = await signUp(data.email, data.password, data.firstName, data.lastName);
    setIsLoading(false);
    if (error) {
      toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Inscription réussie",
        description: "Vous pouvez maintenant vous connecter",
      });
      setAuthMode("signin");
    }
  };

  return (
    <div className="container relative h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-zinc-900/80" />
        <div className="relative z-20 mt-auto">
          <CardTitle className="text-5xl font-bold">
            TogoPropConnect
          </CardTitle>
          <CardDescription className="mt-4 text-zinc-400">
            Votre plateforme immobilière de confiance au Togo.
          </CardDescription>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {authMode === "signin" ? (
            <>
              <CardHeader className="space-y-0">
                <CardTitle>Se connecter</CardTitle>
                <CardDescription>
                  Entrez votre e-mail et votre mot de passe pour vous connecter
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <form onSubmit={signInForm.handleSubmit(handleSignIn)}>
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        placeholder="exemple@gmail.com"
                        type="email"
                        {...signInForm.register("email")}
                      />
                      {signInForm.formState.errors.email && (
                        <p className="text-sm text-red-500">
                          {signInForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <Label htmlFor="password">Mot de passe</Label>
                      <Input
                        id="password"
                        placeholder="********"
                        type="password"
                        {...signInForm.register("password")}
                      />
                      {signInForm.formState.errors.password && (
                        <p className="text-sm text-red-500">
                          {signInForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Patientez...
                      </>
                    ) : (
                      "Se connecter"
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="space-y-0">
                <CardTitle>Créer un compte</CardTitle>
                <CardDescription>
                  Entrez votre e-mail et créez un mot de passe
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)}>
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        type="text"
                        {...signUpForm.register("firstName")}
                      />
                      {signUpForm.formState.errors.firstName && (
                        <p className="text-sm text-red-500">
                          {signUpForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        type="text"
                        {...signUpForm.register("lastName")}
                      />
                      {signUpForm.formState.errors.lastName && (
                        <p className="text-sm text-red-500">
                          {signUpForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        placeholder="exemple@gmail.com"
                        type="email"
                        {...signUpForm.register("email")}
                      />
                      {signUpForm.formState.errors.email && (
                        <p className="text-sm text-red-500">
                          {signUpForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <Label htmlFor="password">Mot de passe</Label>
                      <Input
                        id="password"
                        placeholder="********"
                        type="password"
                        {...signUpForm.register("password")}
                      />
                      {signUpForm.formState.errors.password && (
                        <p className="text-sm text-red-500">
                          {signUpForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Patientez...
                      </>
                    ) : (
                      "Créer un compte"
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          )}
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou
              </span>
            </div>
          </div>
          <Button variant="secondary" className="w-full" onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}>
            {authMode === "signin"
              ? "Créer un compte"
              : "J'ai déjà un compte"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
