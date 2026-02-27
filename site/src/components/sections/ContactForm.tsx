"use client";

import { useState } from "react";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { Package, Handshake, BarChart2, type LucideIcon } from "lucide-react";

const PILOT_POINTS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Package,    title: "Pilot pakket",              text: "Tot 10 licenties gratis gedurende 30 dagen" },
  { icon: Handshake,  title: "Persoonlijke begeleiding",   text: "We helpen u met de introductie naar medewerkers" },
  { icon: BarChart2,  title: "Evaluatie na afloop",        text: "Gezamenlijke terugkoppeling: wat vonden medewerkers ervan?" },
];

interface FormState {
  name: string;
  email: string;
  company: string;
  employees: string;
  message: string;
}

const initialState: FormState = {
  name: "",
  email: "",
  company: "",
  employees: "",
  message: "",
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Netlify form handling — the `data-netlify="true"` attribute picks this up automatically
    // on Netlify deployments. For development / other hosts a mailto fallback is used.
    const mailto = `mailto:info@lumio.app?subject=Pilot aanvraag – ${encodeURIComponent(form.company)}&body=${encodeURIComponent(
      `Naam: ${form.name}\nE-mail: ${form.email}\nBedrijf: ${form.company}\nMedewerkers: ${form.employees}\n\n${form.message}`
    )}`;
    window.location.href = mailto;
    setSubmitted(true);
  };

  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Info block */}
          <div>
            <SectionHeading
              badge="Gratis pilot"
              title="Probeer Lumio 30 dagen gratis"
              subtitle="Vraag een vrijblijvende pilot aan voor uw team.
              We sturen u licenties toe en begeleiden u bij de introductie."
            />

            <div className="space-y-5 mt-2">
              {PILOT_POINTS.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <item.icon className="w-6 h-6 flex-shrink-0 text-[var(--color-primary-700)]" strokeWidth={1.5} />
                  <div>
                    <p className="font-semibold text-[var(--color-neutral-900)]">{item.title}</p>
                    <p className="text-sm text-[var(--color-neutral-600)]">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          {submitted ? (
            <div className="bg-[var(--color-primary-50)] rounded-2xl p-10 text-center border border-[var(--color-primary-100)]">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="font-display text-2xl text-[var(--color-neutral-900)] mb-2">Bedankt!</h3>
              <p className="text-[var(--color-neutral-600)]">We nemen zo snel mogelijk contact met u op.</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              data-netlify="true"
              name="pilot-aanvraag"
              className="bg-[var(--color-primary-50)] rounded-2xl p-8 border border-[var(--color-primary-100)] space-y-5"
            >
              <input type="hidden" name="form-name" value="pilot-aanvraag" />

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-neutral-900)] mb-1.5">
                    Uw naam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[var(--color-primary-100)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)]"
                    placeholder="Jan de Vries"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-neutral-900)] mb-1.5">
                    E-mailadres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[var(--color-primary-100)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)]"
                    placeholder="jan@bedrijf.nl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-neutral-900)] mb-1.5">
                  Bedrijfsnaam <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="company"
                  required
                  value={form.company}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[var(--color-primary-100)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)]"
                  placeholder="Uw Bedrijf B.V."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-neutral-900)] mb-1.5">
                  Aantal medewerkers
                </label>
                <select
                  name="employees"
                  value={form.employees}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[var(--color-primary-100)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)]"
                >
                  <option value="">Kies een range</option>
                  <option value="1-10">1 – 10</option>
                  <option value="11-50">11 – 50</option>
                  <option value="51-200">51 – 200</option>
                  <option value="201-500">201 – 500</option>
                  <option value="500+">500+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-neutral-900)] mb-1.5">
                  Toelichting (optioneel)
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-lg border border-[var(--color-primary-100)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)] resize-none"
                  placeholder="Vertel ons iets over uw organisatie of uw wensen..."
                />
              </div>

              <Button type="submit" size="md">
                Pilot aanvragen
              </Button>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
