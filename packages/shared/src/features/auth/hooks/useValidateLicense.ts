import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { validateLicense } from "../api/client";
import type { ValidateLicensePayload } from "../api/client";

export function useValidateLicense() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: ValidateLicensePayload) => validateLicense(payload),
    onSuccess: (data, variables) => {
      if (data.valid) {
        toast.success("Licence valide", {
          description: "Vous pouvez maintenant créer votre compte",
        });
        navigate({
          to: "/auth/register-tenant",
          search: { licenseKey: data.licenseKey ?? variables.licenseKey },
        });
      } else {
        toast.error("Licence invalide", {
          description: data.error || "La clé de licence fournie est invalide",
        });
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || "Erreur de validation de la licence";
      toast.error("Licence invalide", { description: message });
    },
  });
}
