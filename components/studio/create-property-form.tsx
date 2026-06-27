"use client";

import { useActionState, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPropertyAction } from "@/lib/actions/properties";
import type { AuthActionState } from "@/lib/actions/auth";
import { CONDITION_LABEL, DEAL_TYPE_LABEL, TARGET_AUDIENCE_LABEL, TONE_LABEL, TYPOLOGY_LABEL } from "@/lib/labels";
import type { CommunicationTone, DealType, PropertyCondition, PropertyType } from "@/lib/types/domain";

const INITIAL_STATE: AuthActionState = {};

const PROPERTY_TYPES = Object.keys(TYPOLOGY_LABEL) as PropertyType[];
const DEAL_TYPES = Object.keys(DEAL_TYPE_LABEL) as DealType[];
const CONDITIONS = Object.keys(CONDITION_LABEL) as PropertyCondition[];
const TONES = Object.keys(TONE_LABEL) as CommunicationTone[];
const AUDIENCES = Object.keys(TARGET_AUDIENCE_LABEL);

export function CreatePropertyForm() {
  const [state, formAction, isSubmitting] = useActionState(createPropertyAction, INITIAL_STATE);
  const [propertyType, setPropertyType] = useState<PropertyType>("t2");
  const [dealType, setDealType] = useState<DealType>("sale");
  const [condition, setCondition] = useState<PropertyCondition>("used");
  const [tone, setTone] = useState<CommunicationTone>("premium");

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="property_type" value={propertyType} />
      <input type="hidden" name="deal_type" value={dealType} />
      <input type="hidden" name="condition" value={condition} />
      <input type="hidden" name="tone" value={tone} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informação básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Título interno</Label>
              <Input id="title" name="title" placeholder="Ex.: T3 na Rua das Flores" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Localização</Label>
              <Input id="location" name="location" placeholder="Ex.: Cascais, Lisboa" required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="price">Preço (€)</Label>
              <Input id="price" name="price" type="number" min={0} step="0.01" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="property_type">Tipologia</Label>
              <Select value={propertyType} onValueChange={(value) => setPropertyType(value as PropertyType)}>
                <SelectTrigger id="property_type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {TYPOLOGY_LABEL[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deal_type">Negócio</Label>
              <Select value={dealType} onValueChange={(value) => setDealType(value as DealType)}>
                <SelectTrigger id="deal_type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEAL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {DEAL_TYPE_LABEL[type]}
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
          <CardTitle className="text-base">Características</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="bedrooms">Quartos</Label>
              <Input id="bedrooms" name="bedrooms" type="number" min={0} defaultValue={0} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bathrooms">Casas de banho</Label>
              <Input id="bathrooms" name="bathrooms" type="number" min={0} defaultValue={0} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="useful_area">Área útil (m²)</Label>
              <Input id="useful_area" name="useful_area" type="number" min={0} step="0.01" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gross_area">Área bruta (m²)</Label>
              <Input id="gross_area" name="gross_area" type="number" min={0} step="0.01" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="condition">Estado</Label>
              <Select value={condition} onValueChange={(value) => setCondition(value as PropertyCondition)}>
                <SelectTrigger id="condition" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {CONDITION_LABEL[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="energy_certificate">Certificado energético</Label>
              <Input id="energy_certificate" name="energy_certificate" placeholder="Ex.: B-" />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Checkbox id="has_garage" name="has_garage" />
              <Label htmlFor="has_garage">Garagem</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="has_garden" name="has_garden" />
              <Label htmlFor="has_garden">Jardim</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="has_pool" name="has_pool" />
              <Label htmlFor="has_pool">Piscina</Label>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição interna</Label>
            <Textarea id="description" name="description" rows={3} placeholder="Notas internas sobre o imóvel (opcional)." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" /> Para a IA gerar o pack de promoção
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tone">Tom de comunicação</Label>
            <Select value={tone} onValueChange={(value) => setTone(value as CommunicationTone)}>
              <SelectTrigger id="tone" className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {TONE_LABEL[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Público-alvo</Label>
            <div className="flex flex-wrap gap-4">
              {AUDIENCES.map((audience) => (
                <div key={audience} className="flex items-center gap-2">
                  <Checkbox id={`audience-${audience}`} name="target_audience" value={audience} />
                  <Label htmlFor={`audience-${audience}`}>{TARGET_AUDIENCE_LABEL[audience]}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="strengths">Pontos fortes</Label>
              <Textarea id="strengths" name="strengths" rows={3} placeholder="Ex.: Vista mar, remodelado, perto do centro…" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weaknesses">Pontos a atenuar</Label>
              <Textarea id="weaknesses" name="weaknesses" rows={3} placeholder="Ex.: Sem elevador, precisa pintura…" />
            </div>
          </div>
        </CardContent>
      </Card>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          Criar imóvel
        </Button>
      </div>
    </form>
  );
}
