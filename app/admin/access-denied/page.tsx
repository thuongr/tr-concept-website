export default function AccessDenied() {
  return <section className="admin-page"><div className="shell narrow">
    <p className="eyebrow">Admin access</p><h1>Owner access required.</h1>
    <p>This account does not have verified access to the TRConcept admin. Ask the project owner to check its membership.</p>
    <form action="/api/admin/logout" method="post"><button className="button" type="submit">Sign out</button></form>
  </div></section>;
}
