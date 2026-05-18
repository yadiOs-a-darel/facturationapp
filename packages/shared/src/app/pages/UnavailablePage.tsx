import { Link } from "@tanstack/react-router";
import { Home, Construction } from "lucide-react";
import { Button } from "../../components/ui/button";

const hasToken = () =>
  typeof window !== "undefined" && !!localStorage.getItem("gestfacturation_token");

export function UnavailablePage() {
  const homeTo = hasToken() ? "/" : "/auth/login";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Construction className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Cette page est indisponible</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        La page que vous recherchez n&apos;existe pas encore ou n&apos;est pas accessible.
        Cliquez sur Accueil pour retourner à l&apos;accueil.
      </p>
      <Button asChild className="mt-8 gap-2">
        <Link to={homeTo}>
          <Home className="h-4 w-4" />
          Accueil
        </Link>
      </Button>
    </div>
  );
}
