"use client";

import { useActionState, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createContactAction } from "@/lib/actions/commercial";
import type { AuthActionState } from "@/lib/actions/auth";
import { CONTACT_INTEREST_LABEL, CONTACT_SOURCE_LABEL, CONTACT_TYPE_LABEL, TYPOLOGY_LABEL } from "@/lib/labels";
import type { ContactInterest, ContactSource, ContactType, PropertyType } from "@/lib/types/domain";

const INITIAL_STATE: AuthActionState = {};

const CONTACT_TYPES = Object.keys(CONTACT_TYPE_LABEL) as ContactType[];
const CONTACT_SOURCES = Object.keys(CONTACT_SOURCE_LABEL) as ContactSource[];
const CONTACT_INTERESTS = Object.keys(CONTACT_INTEREST_LABEL) as ContactInterest[];
const PROPERTY_TYPES = Object.keys(TYPOLOGY_LABEL) as PropertyType[];

interface PropertyOption {
  id: string;
  title: string;
}

interface CreateContactFormProps {
  properties: PropertyOption[];
}

export function CreateContactForm({ properties }: CreateContactFormProps) {
  const [state, formAction, isSubmitting] = useActionState(createContactAction, INITIAL_STATE);
  const [type, setType] = useState<ContactType>("buyer");
  const [source, setSource] = useState<ContactSource>("other");
  const [interest, setInterest] = useState<ContactInterest>("buy");
  const [desiredTypology, setDesiredTypology] = useState<PropertyType | "">("");
  const [relatedPropertyId, setRelatedPropertyId] = useState<string>("");

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="interest" value={interest} />
      <input type="hidden" name="desired_typology" value={desiredTypology} />
      <input type="hidden" name="related_property_id" value={relatedPropertyId} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" placeholder="Ex.: Maria Santos" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" name="phone" placeholder="Ex.: 912 345 678" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="Ex.: maria@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={(value) => setType(value as ContactType)}>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {CONTACT_TYPE_LABEL[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="source">Origem</Label>
              <Select value={source} onValueChange={(value) => setSource(value as ContactSource)}>
                <SelectTrigger id="source" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_SOURCES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {CONTACT_SOURCE_LABEL[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="interest">Interesse</Label>
              <Select value={interest} onValueChange={(value) => setInterest(value as ContactInterest)}>
                <SelectTrigger id="interest" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_INTERESTS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {CONTACT_INTEREST_LABEL[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">O que procura</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="budget">Orçamento (€)</Label>
              <Input id="budget" name="budget" type="number" min={0} step="0.01" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desired_location">Localização desejada</Label>
              <Input id="desired_location" name="desired_location" placeholder="Ex.: Cascais" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desired_typology_select">Tipologia desejada</Label>
              <Select value={desiredTypology} onValueChange={(value) => setDesiredTypology(value as PropertyType)}>
                <SelectTrigger id="desired_typology_select" className="w-full">
                  <SelectValue placeholder="Qualquer" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {TYPOLOGY_LABEL[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {properties.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="related_property_select">Imóvel associado</Label>
              <Select value={relatedPropertyId} onValueChange={setRelatedPropertyId}>
                <SelectTrigger id="related_property_select" className="w-full">
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" name="notes" rows={3} placeholder="Notas internas sobre o contacto (opcional)." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="next_action">Próxima ação</Label>
            <Input id="next_action" name="next_action" placeholder="Ex.: Agendar visita para sábado" />
          </div>
          <div className="flex items-start gap-2">
            <Checkbox id="gdpr_consent" name="gdpr_consent" className="mt-0.5" />
            <Label htmlFor="gdpr_consent" className="text-sm font-normal text-muted-foreground">
              O contacto consentiu o tratamento dos seus dados pessoais, em conformidade com o RGPD.
            </Label>
          </div>
        </CardContent>
      </Card>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
          Criar contacto
        </Button>
      </div>
    </form>
  );
}
