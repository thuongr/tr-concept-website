/** Fixed application origin: never trust a supplied Host/redirect URL for recovery links. */
export function recoveryOrigin() {
  return new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tr-concept-website.vercel.app').origin;
}
export function isRecoveryOrigin(request: Request) {
  return request.headers.get('origin') === recoveryOrigin();
}
