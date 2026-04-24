import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/settings";
import { useState } from "react";
import { toast } from "sonner";
import { Settings as SettingsIcon, Save } from "lucide-react";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const settings = useSettings();
  const [form, setForm] = useState({
    salonName: settings.salonName,
    ownerEmail: settings.ownerEmail,
    whatsappNumber: settings.whatsappNumber,
    smsNumber: settings.smsNumber,
    smsSenderId: settings.smsSenderId,
  });

  const save = () => {
    settings.update(form);
    toast.success("Settings saved");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Card className="p-6 space-y-5">
        <h2 className="font-semibold">Salon</h2>
        <div className="space-y-2">
          <Label>Salon name</Label>
          <Input
            value={form.salonName}
            onChange={(e) => setForm({ ...form, salonName: e.target.value })}
            placeholder="My Salon"
          />
        </div>
      </Card>

      <Card className="p-6 space-y-5">
        <h2 className="font-semibold">Report recipients</h2>
        <p className="text-sm text-muted-foreground">
          Used by the buttons on the Reports page to send the daily report.
        </p>

        <div className="space-y-2">
          <Label>Owner email</Label>
          <Input
            type="email"
            value={form.ownerEmail}
            onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
            placeholder="owner@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label>WhatsApp number</Label>
          <Input
            value={form.whatsappNumber}
            onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
            placeholder="250788123456 (no +, no spaces)"
          />
          <p className="text-xs text-muted-foreground">
            Country code + number, digits only. Example: 250788123456.
          </p>
        </div>

        <div className="space-y-2">
          <Label>SMS number</Label>
          <Input
            value={form.smsNumber}
            onChange={(e) => setForm({ ...form, smsNumber: e.target.value })}
            placeholder="+250788123456"
          />
        </div>

        <div className="space-y-2">
          <Label>SMS sender ID</Label>
          <Input
            value={form.smsSenderId}
            onChange={(e) => setForm({ ...form, smsSenderId: e.target.value })}
            placeholder="Salon"
          />
          <p className="text-xs text-muted-foreground">
            Shown as the sender on the SMS (esmsafrica.io).
          </p>
        </div>
      </Card>

      <Button onClick={save} className="gap-2">
        <Save className="h-4 w-4" />
        Save settings
      </Button>
    </div>
  );
}
