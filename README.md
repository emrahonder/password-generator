# Şifre Oluşturucu / Password Generator

[Türkçe](#türkçe) · [English](#english)

---

## Türkçe

Güçlü ve rastgele şifreler üreten, sade bir web sayfası. Sunucu, hesap ya da bağımlılık yok. Her şey tarayıcında çalışır.

### Özellikler

- 4 ile 64 karakter arası uzunluk.
- Büyük harf, küçük harf, rakam ve özel karakter seçenekleri. Seçtiğin her türden şifreye en az bir karakter girer.
- Benzer karakterleri (`0 O 1 l I`) çıkarma seçeneği.
- Güç göstergesi (şifrenin entropisine göre).
- Tek tıkla kopyalama.
- Şifreler tarayıcının güvenli rastgele sayı üretecini (`crypto.getRandomValues`) kullanır. Karakter seçimi modulo yanlılığı olmadan yapılır.
- Türkçe ve İngilizce arayüz (TR / EN).
- Şifreler hiçbir yerde saklanmaz. Yalnızca dil ve seçeneklerin tarayıcında tutulur.
- Eski bağlantılar çalışır: `?len=10&spec=true`.

### Çalıştırma

Derleme gerekmez. `index.html` dosyasını tarayıcıda aç. İstersen GitHub Pages ile yayınlayabilirsin.

### Yapı

```
index.html      sayfa
css/style.css   tasarım
js/app.js       üretim, kopyalama ve dil mantığı
js/i18n.js      Türkçe ve İngilizce metinler
images/         logo ve favicon
```

### Not

Oluşturulan şifrelerin kullanımından site sorumlu değildir. Şifrelerini bir parola yöneticisinde saklamanı öneririz.

---

## English

A simple web page that generates strong, random passwords. No server, accounts or dependencies. Everything runs in your browser.

### Features

- Length from 4 to 64 characters.
- Uppercase, lowercase, digit and symbol options. Every type you select appears at least once.
- Option to exclude look-alike characters (`0 O 1 l I`).
- Strength meter (based on the password's entropy).
- One-click copy.
- Passwords use the browser's secure random number generator (`crypto.getRandomValues`). Characters are picked without modulo bias.
- Turkish and English interface (TR / EN).
- Passwords are never stored. Only your language and options are kept in your browser.
- Old links keep working: `?len=10&spec=true`.

### Running it

No build step. Open `index.html` in a browser. You can also publish it with GitHub Pages.

### Structure

```
index.html      page
css/style.css   styling
js/app.js       generation, copy and language logic
js/i18n.js      Turkish and English texts
images/         logo and favicon
```

### Note

This site is not responsible for how you use the generated passwords. We recommend storing them in a password manager.
