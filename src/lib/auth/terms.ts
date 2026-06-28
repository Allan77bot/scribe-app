// Vérifie l'acceptation des CGU côté serveur (la case HTML `required` est contournable
// par un POST direct). Une case cochée envoie sa valeur ("on" par défaut, ou "true").
export function isTermsAccepted(value: FormDataEntryValue | null): boolean {
  if (typeof value !== "string") return false;
  return value === "on" || value === "true";
}
