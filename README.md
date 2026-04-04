# 🐙 Sinus — Pixels & Emoções

## 📁 Estrutura de arquivos no VS Code

```
sinus/
│
├── 📄 index.html          ← Chat principal (protegido por login)
├── 📄 login.html          ← Tela de login e cadastro
├── 📄 firebase-config.js  ← Configuração do Firebase (preencha com seus dados)
├── 📄 chat.js             ← NÃO fica aqui — vai na pasta api/
│
├── 📁 api/
│   └── 📄 chat.js         ← Backend seguro (API do Groq)
│
├── 📄 package.json
├── 📄 .gitignore
└── 📄 sinus.png           ← Ícone favicon (opcional)
```

---

## 🔥 Como configurar o Firebase

### 1. Criar projeto
- Acesse https://console.firebase.google.com
- Clique em "Adicionar projeto"
- Dê um nome (ex: `sinus-pixels-emocoes`)
- Desative o Google Analytics (opcional)

### 2. Ativar Autenticação
- No menu lateral: **Authentication → Primeiros passos**
- Clique em **E-mail/senha** → Ativar → Salvar

### 3. Criar banco de dados (Firestore)
- No menu lateral: **Firestore Database → Criar banco de dados**
- Escolha **Modo de produção**
- Selecione a região mais próxima (ex: `us-east1`)

### 4. Regras do Firestore
Vá em **Firestore → Regras** e cole isso:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
Clique em **Publicar**.

### 5. Pegar as credenciais
- Vá em **Configurações do projeto (⚙️) → Seus apps → Adicionar app → Web (</>)**
- Dê um apelido e clique em "Registrar app"
- Copie o objeto `firebaseConfig` e cole no arquivo `firebase-config.js`

### 6. Variável de ambiente no Vercel
Adicione em **Settings → Environment Variables**:
```
GROQ_API_KEY = gsk_sua-chave-aqui
```

---

## 🚀 Subir para o GitHub / Vercel
1. Suba todos os arquivos no GitHub (exceto `.env.local`)
2. No Vercel, importe o repositório normalmente
3. O `firebase-config.js` **pode** ir para o GitHub — as chaves do Firebase são públicas por design (a segurança é feita pelas regras do Firestore)
