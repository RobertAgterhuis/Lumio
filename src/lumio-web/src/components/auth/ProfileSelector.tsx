"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { useAuthStore, type Profile } from "@/stores/authStore";
import { Users, Plus, UserCircle } from "lucide-react";

interface ProfileSelectorProps {
  onProfileSelected: () => void;
}

export function ProfileSelector({ onProfileSelected }: ProfileSelectorProps) {
  const { profiles, setProfiles, setActiveProfile, setProfileSelected, setProfileNeedsSetup } =
    useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRelatie, setNewRelatie] = useState("Partner");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSelect = async (profile: Profile) => {
    setError("");
    setLoading(true);
    try {
      const result = await api.post<{ bericht: string; heeftSetupNodig: boolean }>(
        "/api/auth/selecteer-profiel",
        { profielId: profile.id }
      );
      setActiveProfile(profile);
      setProfileSelected(true);
      setProfileNeedsSetup(result.heeftSetupNodig);
      onProfileSelected();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profiel selecteren mislukt");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newName.trim()) return;

    setLoading(true);
    try {
      const profile = await api.post<Profile>("/api/profielen", {
        naam: newName.trim(),
        relatie: profiles.length === 0 ? "Primair" : newRelatie,
      });
      setProfiles([...profiles, profile]);
      setShowCreate(false);
      setNewName("");
      // Auto-select the new profile
      await handleSelect(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profiel aanmaken mislukt");
      setLoading(false);
    }
  };

  const relatieOptions = ["Partner", "Kind", "Ouder", "Overig"];

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Profiel kiezen</CardTitle>
        <CardDescription>
          {profiles.length === 0
            ? "Maak uw eerste profiel aan om te beginnen."
            : "Selecteer een profiel om door te gaan."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing profiles */}
        {profiles.length > 0 && !showCreate && (
          <div className="space-y-2">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleSelect(profile)}
                disabled={loading}
                className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent hover:border-primary/50 disabled:opacity-50"
              >
                <UserCircle className="h-10 w-10 text-primary/60 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{profile.naam}</p>
                  <p className="text-sm text-muted-foreground">{profile.relatie}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Create new profile form */}
        {(showCreate || profiles.length === 0) && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Naam</Label>
              <Input
                id="profile-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Bijv. Jan, Mijn profiel"
                required
                autoFocus
              />
            </div>

            {profiles.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="profile-relatie">Relatie</Label>
                <div className="flex flex-wrap gap-2">
                  {relatieOptions.map((rel) => (
                    <Button
                      key={rel}
                      type="button"
                      variant={newRelatie === rel ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewRelatie(rel)}
                    >
                      {rel}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !newName.trim()}>
              {loading ? "Aanmaken..." : "Profiel aanmaken"}
            </Button>

            {profiles.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowCreate(false)}
              >
                Annuleren
              </Button>
            )}
          </form>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Add new profile button (only when there are existing profiles) */}
        {profiles.length > 0 && profiles.length < 5 && !showCreate && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowCreate(true)}
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nieuw profiel toevoegen
          </Button>
        )}

        {profiles.length >= 5 && !showCreate && (
          <p className="text-xs text-muted-foreground text-center">
            Maximaal 5 profielen bereikt.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
