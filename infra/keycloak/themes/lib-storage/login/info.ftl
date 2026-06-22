<!DOCTYPE html>
<html lang="${(locale.currentLanguageTag)!'vi'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${msg("systemNoticeTitle")}</title>
  <link rel="stylesheet" href="${url.resourcesPath}/css/lib-storage.css?v=register-row-space-20260617">
</head>
<body class="ls-auth-page ls-auth-info-page">
  <main class="ls-auth-shell ls-auth-shell-compact">
    <section class="ls-auth-hero" aria-label="${msg("systemNoticeTitle")}">
      <div class="ls-auth-icon" aria-hidden="true">
        <span>i</span>
      </div>
      <h1>${msg("systemNoticeTitle")}</h1>
      <p>${kcSanitize(message.summary?replace("Please specify this field.", msg("requiredFieldMessage")))?no_esc}</p>
    </section>

    <section class="ls-auth-card">
      <div class="ls-auth-actions">
        <#if pageRedirectUri??>
          <a class="ls-auth-primary ls-auth-link-button" href="${pageRedirectUri}">${msg("doContinue")}</a>
        <#elseif actionUri??>
          <a class="ls-auth-primary ls-auth-link-button" href="${actionUri}">${msg("doContinue")}</a>
        <#else>
          <a class="ls-auth-primary ls-auth-link-button" href="${url.loginUrl}">${msg("backToLogin")}</a>
        </#if>
      </div>
    </section>
  </main>
</body>
</html>
