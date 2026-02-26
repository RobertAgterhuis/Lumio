"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { toast } from "@/stores/toastStore";
import { useAuthStore, type Profile } from "@/stores/authStore";
import { profileCreateSchema, type ProfileCreateForm } from "@/lib/schemas/instellingen";
import { useTranslations } from "next-intl";
import { Users, Plus, Trash2, Loader2 } from "lucide-react";
import { LumioIcon } from "@/components/ui/lumio-icon";

const RELATION_TYPES = ["Partner", "Kind", "Ouder", "Overig"] as const;

interface ProfilesCardProps {
  /** Callback when delete confirmation is requested */
  onDeleteRequest?: (profileId: string) => void;
}

/**
 * Card component for managing user profiles (nabestaanden).
 * Displays existing profiles and allows creating new ones.
 */
export function ProfilesCard({ onDeleteRequest }: ProfilesCardProps) {
  const t = useTranslations("instellingen");
  const tf = useTranslations("feedback");
  const { profiles, activeProfile, setProfiles } = useAuthStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileCreateForm>({
    resolver: zodResolver(profileCreateSchema),
    defaultValues: {
      naam: "",
      relatie: "Partner",
    },
  });

  const selectedRelatie = watch("relatie");

  const onSubmit = async (data: ProfileCreateForm) => {
    setMessage(null);
    try {
      const profile = await api.post<Profile>("/api/profielen", {
        naam: data.naam.trim(),
        relatie: data.relatie,
      });
      setProfiles([...profiles, profile]);
      reset();
      setShowCreateForm(false);
      setMessage({
        type: "success",
        text: t("profielen.aangemaakt", { naam: profile.naam }),
      });
      toast.success(tf("aangemaakt"));
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : t("profielen.aanmakenMislukt"),
      });
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    reset();
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-primary-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
        <Users className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-primary leading-tight">{t("profielen.titel")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t("profielen.beschrijving")}</p>
        </div>
      </div>
      <CardContent className="pt-5 space-y-4">
        {/* Existing profiles list */}
        <div className="space-y-2">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <LumioIcon name="profiel" size="xl" className="text-primary/60 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {profile.naam}
                    {activeProfile?.id === profile.id && (
                      <span className="ml-2 text-xs text-primary font-normal">
                        {t("profielen.actief")}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t(`profielen.relaties.${profile.relatie}`)}
                  </p>
                </div>
              </div>
              {!profile.isPrimair && profile.id !== activeProfile?.id && onDeleteRequest && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => onDeleteRequest(profile.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {message && (
          <p
            className={`text-sm ${
              message.type === "success" ? "text-success" : "text-danger"
            }`}
          >
            {message.text}
          </p>
        )}

        {/* Create profile form */}
        {showCreateForm ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3 max-w-md rounded-lg border border-border p-4"
          >
            <FormField.Root error={errors.naam?.message} required>
              <FormField.Label>{t("profielen.naam")}</FormField.Label>
              <FormField.Input
                {...register("naam")}
                placeholder={t("profielen.naamPlaceholder")}
                autoFocus
              />
              <FormField.Error />
            </FormField.Root>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("profielen.relatie")}</label>
              <div className="flex flex-wrap gap-2">
                {RELATION_TYPES.map((rel) => (
                  <Button
                    key={rel}
                    type="button"
                    variant={selectedRelatie === rel ? "default" : "outline"}
                    size="sm"
                    onClick={() => setValue("relatie", rel)}
                  >
                    {t(`profielen.relaties.${rel}`)}
                  </Button>
                ))}
              </div>
              {errors.relatie && (
                <p className="text-sm text-destructive">{errors.relatie.message}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t("profielen.aanmaken")}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                {t("profielen.annuleren")}
              </Button>
            </div>
          </form>
        ) : profiles.length < 5 ? (
          <Button variant="outline" size="sm" onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("profielen.nieuwProfiel")}
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">{t("profielen.maxBereikt")}</p>
        )}
      </CardContent>
    </Card>
  );
}
