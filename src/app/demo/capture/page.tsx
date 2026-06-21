// DÉMO — réutilise l'écran Capturer RÉEL (aucune copie).
// Sans session, l'upload échoue → c'est précisément ce qui démontre la correction
// du lot fix/stabilite-prod : l'enregistrement est conservé (« Réessayer l'envoi »
// / « Supprimer », et récupération au rechargement), il n'est jamais perdu.
export { default } from "@/app/dashboard/capture/page";
