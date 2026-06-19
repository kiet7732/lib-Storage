<!DOCTYPE html>
<html lang="${(locale.currentLanguageTag)!'vi'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${msg("loginTimeoutTitle")}</title>
  <link rel="stylesheet" href="${url.resourcesPath}/css/lib-storage.css?v=register-row-space-20260617">
</head>
<body class="ls-auth-page ls-auth-expired-page">
  <main class="ls-auth-shell ls-auth-shell-compact">
    <section class="ls-auth-hero" aria-label="${msg("loginTimeoutTitle")}">
      <div class="ls-auth-icon" aria-hidden="true">
        <span>↻</span>
      </div>
      <h1>${msg("loginTimeoutTitle")}</h1>
    </section>

    <section class="ls-auth-card">
      <div class="ls-auth-card-head">
        <div>
          <span class="ls-auth-eyebrow">${msg("ssoLabel")}</span>
          <h2>${msg("continueLoginTitle")}</h2>
        </div>
        <span class="ls-auth-pill">${msg("identityProviderLabel")}</span>
      </div>

      <div class="ls-auth-actions">
        <a class="ls-auth-primary ls-auth-link-button" href="${url.loginRestartFlowUrl}">${msg("restartLogin")}</a>
        <a class="ls-auth-secondary" href="${url.loginUrl}">${msg("backToLogin")}</a>
      </div>
    </section>
  </main>
</body>
</html>
