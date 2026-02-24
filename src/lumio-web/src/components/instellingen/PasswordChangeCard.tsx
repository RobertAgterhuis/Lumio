"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { api } from "@/lib/api-client";
import { toast } from "@/stores/toastStore";
import { passwordChangeSchema, type PasswordChangeForm } from "@/lib/schemas/instellingen";
import { useTranslations } from "next-intl";
import { Key, Loader2 } from "lucide-react";

/**
 * Card component for changing the user's password.
 * Uses react-hook-form with Zod validation for client-side form handling.
 */
export function PasswordChangeCard() {
  const t = useTranslations("instellingen");
  const tf = useTranslations("feedback");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordChangeForm>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      huidigWachtwoord: "",
      nieuwWachtwoord: "",
      bevestigWachtwoord: "",
    },
  });

  const nieuwWachtwoord = watch("nieuwWachtwoord");

  const onSubmit = async (data: PasswordChangeForm) => {
    setMessage(null);
    try {
      await api.post("/api/auth/wachtwoord", {
        huidigWachtwoord: data.huidigWachtwoord,
        nieuwWachtwoord: data.nieuwWachtwoord,
      });
      setMessage({
        type: "success",
        text: t("wachtwoord.gewijzigd"),
      });
      toast.success(tf("opgeslagen"));
      reset();
    } catch {
      setMessage({
        type: "error",
        text: t("wachtwoord.wijzigenMislukt"),
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" /> {t("wachtwoord.titel")}
        </CardTitle>
        <CardDescription>{t("wachtwoord.beschrijving")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <FormField.Root error={errors.huidigWachtwoord?.message} required>
            <FormField.Label>{t("wachtwoord.huidig")}</FormField.Label>
            <FormField.Input type="password" {...register("huidigWachtwoord")} />
            <FormField.Error />
          </FormField.Root>

          <FormField.Root error={errors.nieuwWachtwoord?.message} required>
            <FormField.Label>{t("wachtwoord.nieuw")}</FormField.Label>
            <FormField.Input type="password" {...register("nieuwWachtwoord")} />
            <PasswordStrengthMeter password={nieuwWachtwoord} />
            <FormField.Error />
          </FormField.Root>

          <FormField.Root error={errors.bevestigWachtwoord?.message} required>
            <FormField.Label>{t("wachtwoord.bevestig")}</FormField.Label>
            <FormField.Input type="password" {...register("bevestigWachtwoord")} />
            <FormField.Error />
          </FormField.Root>

          {message && (
            <p
              className={`text-sm ${
                message.type === "success" ? "text-success" : "text-danger"
              }`}
            >
              {message.text}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t("wachtwoord.wijzigen")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
