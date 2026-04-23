import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLang(lang === "en" ? "rw" : "en")}
      className="gap-2"
    >
      <Languages className="h-4 w-4" />
      {lang === "en" ? "EN" : "RW"}
    </Button>
  );
}
