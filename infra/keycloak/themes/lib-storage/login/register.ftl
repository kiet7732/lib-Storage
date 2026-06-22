<!DOCTYPE html>
<html lang="${(locale.currentLanguageTag)!'vi'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${msg("registerTitle")}</title>
  <link rel="stylesheet" href="${url.resourcesPath}/css/lib-storage.css?v=register-row-space-20260617">
</head>
<body class="ls-auth-page ls-auth-register-page">
  <a class="ls-auth-back" href="${url.loginUrl}">← ${msg("backToLoginShort")}</a>
  <main class="ls-auth-shell">
    <section class="ls-auth-hero" aria-label="${msg("registerTitle")}">
      <div class="ls-auth-icon" aria-hidden="true">
        <span>◎</span>
      </div>
      <h1>${msg("registerHeroTitle")}</h1>
    </section>

    <section class="ls-auth-card ls-auth-card-register">
      <div class="ls-auth-card-head">
        <div>
          <h2>${msg("registerStudentTitle")}</h2>
        </div>
      </div>

      <#if message?has_content>
        <div class="ls-auth-alert ls-auth-alert-${message.type}">
          ${kcSanitize(message.summary?replace("Please specify this field.", msg("requiredFieldMessage")))?no_esc}
        </div>
      </#if>

      <form id="kc-register-form" class="ls-auth-form" action="${url.registrationAction}" method="post">
        <#if !realm.registrationEmailAsUsername>
          <div class="ls-auth-field">
            <label for="username">${msg("username")}</label>
            <div class="ls-auth-input">
              <span aria-hidden="true">●</span>
              <input id="username" name="username" type="text" value="${(register.formData.username!'')}" autocomplete="username" placeholder="sv123456">
            </div>
          </div>
        </#if>

        <div class="ls-auth-field">
          <label for="email">${msg("email")}</label>
          <div class="ls-auth-input">
            <span aria-hidden="true">✉</span>
            <input id="email" name="email" type="email" value="${(register.formData.email!'')}" autocomplete="email" placeholder="sv123456@tdmu.edu.vn">
          </div>
        </div>

        <#if !realm.registrationEmailAsUsername>
          <div class="ls-auth-two">
            <div class="ls-auth-field">
              <label for="firstName">${msg("firstName")}</label>
              <div class="ls-auth-input">
                <input id="firstName" name="firstName" type="text" value="${(register.formData.firstName!'')}" autocomplete="given-name" placeholder="${msg("firstNamePlaceholder")}">
              </div>
            </div>

            <div class="ls-auth-field">
              <label for="lastName">${msg("lastName")}</label>
              <div class="ls-auth-input">
                <input id="lastName" name="lastName" type="text" value="${(register.formData.lastName!'')}" autocomplete="family-name" placeholder="${msg("lastNamePlaceholder")}">
              </div>
            </div>
          </div>
        </#if>

        <#if passwordRequired??>
          <div class="ls-auth-field">
            <label for="password">${msg("password")}</label>
            <div class="ls-auth-input">
              <span aria-hidden="true">◆</span>
              <input id="password" name="password" type="password" autocomplete="new-password" placeholder="${msg("password")}">
            </div>
          </div>

          <div class="ls-auth-field">
            <label for="password-confirm">${msg("passwordConfirm")}</label>
            <div class="ls-auth-input">
              <span aria-hidden="true">✓</span>
              <input id="password-confirm" name="password-confirm" type="password" autocomplete="new-password" placeholder="${msg("passwordConfirm")}">
            </div>
          </div>
        </#if>

        <#if recaptchaRequired??>
          <div class="form-group">
            <div class="${properties.kcInputWrapperClass!}">
              <div class="g-recaptcha" data-size="compact" data-sitekey="${recaptchaSiteKey}"></div>
            </div>
          </div>
        </#if>

        <button class="ls-auth-primary" type="submit">
          ${msg("doRegister")}
        </button>
      </form>

      <div class="ls-auth-footer">
        <a href="${url.loginUrl}">${msg("backToLogin")}</a>
      </div>
    </section>
  </main>
  <div class="ls-auth-submit-overlay" aria-hidden="true">
    <div class="ls-auth-submit-overlay__panel">
      <span class="ls-auth-submit-spinner" aria-hidden="true"></span>
    </div>
  </div>
  <script>
    (function () {
      var form = document.getElementById('kc-register-form');
      var button = form ? form.querySelector('button[type="submit"]') : null;
      var isSubmitting = false;

      if (!form) {
        return;
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
