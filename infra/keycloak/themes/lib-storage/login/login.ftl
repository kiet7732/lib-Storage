<!DOCTYPE html>
<html lang="${(locale.currentLanguageTag)!'vi'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${msg("loginTitle")}</title>
  <link rel="stylesheet" href="${url.resourcesPath}/css/lib-storage.css?v=register-row-space-20260617">
</head>
<body class="ls-auth-page ls-auth-login-page">
  <main class="ls-auth-shell">
    <section class="ls-auth-hero" aria-label="${msg("loginTitle")}">
      <div class="ls-auth-icon" aria-hidden="true">
        <span>▦</span>
      </div>
      <h1>${msg("libStorageHeroTitle")}</h1>
    </section>

    <section class="ls-auth-card ls-auth-card-login">
      <div class="ls-auth-card-head">
        <div>
          <h2>${msg("loginAccountTitle")}</h2>
        </div>
      </div>

      <#if message?has_content>
        <div class="ls-auth-alert ls-auth-alert-${message.type}">
          ${kcSanitize(message.summary?replace("Please specify this field.", msg("requiredFieldMessage")))?no_esc}
        </div>
      </#if>

      <form id="kc-form-login" class="ls-auth-form" action="${url.loginAction}" method="post">
        <div class="ls-auth-field">
          <label for="username">${msg("usernameOrEmail")}</label>
          <div class="ls-auth-input">
            <span aria-hidden="true">●</span>
            <input
              id="username"
              name="username"
              type="text"
              value="${(login.username!'')}"
              autocomplete="username"
              autofocus
              placeholder="sv123456@tdmu.edu.vn"
              aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
            >
          </div>
        </div>

        <div class="ls-auth-field">
          <label for="password">${msg("password")}</label>
          <div class="ls-auth-input">
            <span aria-hidden="true">◆</span>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              placeholder="${msg("password")}"
              aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
            >
          </div>
        </div>

        <#if credentialId??>
          <input type="hidden" name="credentialId" value="${credentialId}">
        </#if>

        <div class="ls-auth-row">
          <#if realm.rememberMe && !usernameHidden??>
            <label class="ls-auth-check">
              <input id="rememberMe" name="rememberMe" type="checkbox" <#if login.rememberMe??>checked</#if>>
              <span>${msg("rememberMe")}</span>
            </label>
          </#if>

          <#if realm.resetPasswordAllowed>
            <a href="${url.loginResetCredentialsUrl}">${msg("doForgotPassword")}</a>
          </#if>
        </div>

        <button class="ls-auth-primary" name="login" id="kc-login" type="submit">
          ${msg("doLogIn")}
        </button>
      </form>

      <#if realm.registrationAllowed && !registrationDisabled??>
        <div class="ls-auth-footer">
          <span>${msg("noAccount")}</span>
          <a id="ls-register-link" href="${url.registrationUrl}">${msg("doRegister")}</a>
        </div>
      </#if>
    </section>
  </main>
  <div class="ls-auth-submit-overlay" aria-hidden="true">
    <div class="ls-auth-submit-overlay__panel">
      <span class="ls-auth-submit-spinner" aria-hidden="true"></span>
    </div>
  </div>
  <script>
    (function () {
      var form = document.getElementById('kc-form-login');
      var button = document.getElementById('kc-login');
      var registerLink = document.getElementById('ls-register-link');
      var isSubmitting = false;

      if (!form) {
        return;
      }

      if (registerLink) {
        try {
          var currentParams = new URLSearchParams(window.location.search);
          var shouldOpenRegister = currentParams.get('kc_action') === 'register';
          var defaultRegisterHref = registerLink.getAttribute('href') || '';
          var redirectUri = currentParams.get('redirect_uri') || '';

          if (!redirectUri) {
            var registerUrlParams = new URL(defaultRegisterHref, window.location.origin).searchParams;
            var clientDataParam = registerUrlParams.get('client_data');

            if (clientDataParam) {
              var normalized = clientDataParam.replace(/-/g, '+').replace(/_/g, '/');

              while (normalized.length % 4 !== 0) {
                normalized += '=';
              }

              var clientData = JSON.parse(window.atob(normalized));
              redirectUri = clientData && typeof clientData.ru === 'string' ? clientData.ru : '';
            }
          }

          if (/^https?:\/\//i.test(redirectUri)) {
            var registerAppUrl = new URL(redirectUri);
            registerAppUrl.pathname = '/register';
            registerAppUrl.search = '';
            registerAppUrl.hash = '';
            registerLink.setAttribute('href', registerAppUrl.toString());
          }

          if (shouldOpenRegister && defaultRegisterHref) {
            window.location.replace(defaultRegisterHref);
            return;
          }
        } catch (error) {
          console.warn('Unable to remap registration link.', error);
        }
      }

      form.addEventListener('submit', function (event) {
        if (isSubmitting) {
          return;
        }

        isSubmitting = true;
        event.preventDefault();
        document.body.classList.add('ls-auth-is-submitting');

        if (button) {
          button.setAttribute('disabled', 'disabled');
        }

        window.requestAnimationFrame(function () {
          window.setTimeout(function () {
            form.submit();
          }, 80);
        });
      });
    })();
  </script>
</body>
</html>
