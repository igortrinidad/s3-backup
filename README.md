# S3 Backup

> [English](README.en.md) | Português

## Objetivo

Esse programa tem como objetivo fazer o dump do banco de dados [mysql|postgres] e enviar para o Amazon S3 ou qualquer provedor compatível com S3 (Cloudflare R2, DigitalOcean Spaces, MinIO, Backblaze B2, etc).

## Recursos

- 🗄️ **Suporte a múltiplos bancos**: MySQL, PostgreSQL, MongoDB
- ☁️ **Storage compatível com S3**: AWS S3, Cloudflare R2, DigitalOcean Spaces, MinIO, Backblaze B2
- 📦 **Múltiplos provedores**: Configure diferentes storages para cada instância de banco
- 🔔 **Notificações Discord**: Seja notificado quando backups falharem
- ⏰ **Backups agendados**: Agendador cron integrado para backups automáticos
- 🚀 **Suporte CLI**: Execute backups via npx com arquivos de configuração customizados
- 🐳 **Pronto para Docker**: Suporte para instâncias locais e Docker
- 🔄 **Resiliência a erros**: Continue com outros backups se um falhar

## ⚠️ Versão 2.0.0 - Migração para AWS SDK v3

A partir da versão 2.0.0, este projeto foi atualizado para usar o AWS SDK v3, que oferece:
- Melhor performance e menor tamanho do bundle
- Arquitetura modular e tree-shaking
- Suporte aprimorado para TypeScript
- APIs mais modernas e consistentes
- **Suporte a múltiplos provedores de storage compatíveis com S3**

A configuração do S3 permanece a mesma, apenas a implementação interna foi modernizada.

## Instalação

### Opção 1: Clone do repositório

Faça o clone desse repositório na sua máquina:

```bash
git clone https://github.com/igortrinidad/s3-backup
cd s3-backup
npm install
```

### Opção 2: Instalar via npm (se publicado)

```bash
npm install -g s3-backup
```

## Configuração

Copie o arquivo `.config.example.js` para `.config.js`:

```
cp .config.example.js .config.js
```

Altere as variáveis conforme a necessidade de acesso.

Na variável `CRON_TIME` você deve definir quando o backup será executado, ela possui seis asteriscos separados por espaço. Cada asterisco significa um tempo, seguindo a ordem temos que:

1. representa os segundos (0-59)
2. os minutos (0-59)
3. as horas (0-23)
4. os dias (1-31)
5. os meses (0-11) [Janeiro - Dezembro ]
6. os dias da semana (0-6) [Domingo - Sábado]

## Utilização

### Opção 1: Usando NPX (Recomendado para execução única)

Execute o backup diretamente com npx, passando o caminho do arquivo de configuração:

```bash
npx s3-backup --config ./config.js
```

Ou usando um caminho absoluto:

```bash
npx s3-backup --config /path/to/your/config.js
```

### Opção 2: Usando o CLI após instalação global

Instale o pacote globalmente:

```bash
npm install -g .
```

Execute o backup:

```bash
s3-backup --config ./config.js
```

### Opção 3: Agendamento com Cron (execução programada)

Para backups agendados automáticos, execute o `index.js`:

```bash
node index.js
```

**Importante:** Para uso agendado com cron, você deve ter um arquivo `config.js` na raiz do projeto.

### Opção 4: Execução única sem agendamento

Execute apenas um backup sem agendar:

```bash
node run_backup_standalone.js
```

### Opções do CLI

```
s3-backup --help         # Exibir ajuda
s3-backup --version      # Exibir versão
s3-backup -c <path>      # Especificar arquivo de configuração
```

## Provedores de Storage Suportados

Este projeto suporta qualquer provedor de storage compatível com a API S3. Além do Amazon S3, você pode usar:

### Cloudflare R2

```javascript
s3Default: {
  key: "your-access-key",
  secret: "your-secret-key",
  region: "auto",
  bucket: "your-bucket",
  endpoint: "https://YOUR-ACCOUNT-ID.r2.cloudflarestorage.com",
  forcePathStyle: false
}
```

**Como começar com Cloudflare R2:**
1. Acesse R2 no seu dashboard da Cloudflare
2. Crie um bucket
3. Gere tokens de API (Access Key ID e Secret Access Key)
4. Seu account ID está na URL do R2

### DigitalOcean Spaces

```javascript
s3Default: {
  key: "your-access-key",
  secret: "your-secret-key",
  region: "nyc3", // ou sgp1, fra1, sfo3, etc
  bucket: "your-space",
  endpoint: "https://nyc3.digitaloceanspaces.com",
  forcePathStyle: false
}
```

**Regiões disponíveis:** nyc3, sfo3, sgp1, fra1, ams3, blr1, syd1

### MinIO

```javascript
s3Default: {
  key: "your-access-key",
  secret: "your-secret-key",
  region: "us-east-1",
  bucket: "your-bucket",
  endpoint: "http://localhost:9000",
  forcePathStyle: true
}
```

Perfeito para soluções de armazenamento de objetos auto-hospedadas.

### Backblaze B2

```javascript
s3Default: {
  key: "your-application-key-id",
  secret: "your-application-key",
  region: "us-west-000",
  bucket: "your-bucket",
  endpoint: "https://s3.us-west-000.backblazeb2.com"
}
```

**Como começar com Backblaze B2:**
1. Crie um bucket no Backblaze B2
2. Gere uma Application Key
3. Use o endpoint da API compatível com S3

### Amazon S3 (Padrão)

Para usar o Amazon S3, não é necessário especificar `endpoint`:

```javascript
s3Default: {
  key: "your-access-key",
  secret: "your-secret-key",
  region: "us-east-1",
  bucket: "your-bucket"
}
```

### Configuração por Instância

Você também pode configurar um provedor de storage diferente para cada instância de banco de dados:

```javascript
instances: [
  {
    engine: "mysql",
    host: "127.0.0.1",
    user: "root",
    password: "",
    databases: ["mydb"],
    s3: {
      key: "cloudflare-key",
      secret: "cloudflare-secret",
      region: "auto",
      bucket: "mysql-backups",
      endpoint: "https://YOUR-ACCOUNT-ID.r2.cloudflarestorage.com"
    }
  },
  {
    engine: "pg",
    isDocker: true,
    dockerImage: "postgres-container",
    user: "postgres",
    databases: ["proddb"],
    s3: {
      key: "do-spaces-key",
      secret: "do-spaces-secret",
      region: "nyc3",
      bucket: "postgres-backups",
      endpoint: "https://nyc3.digitaloceanspaces.com"
    }
  }
]
```

## Notificações do Discord

O projeto suporta notificações automáticas no Discord quando ocorrem falhas nos backups. Para configurar:

### 1. Criar um Webhook no Discord

1. Abra o servidor do Discord onde deseja receber as notificações
2. Vá em **Configurações do Servidor** > **Integrações** > **Webhooks**
3. Clique em **Novo Webhook**
4. Configure o nome e o canal onde as notificações serão enviadas
5. Copie a **URL do Webhook**

### 2. Configurar no projeto

No arquivo `config.js`, adicione a configuração do Discord:

```javascript
discord: {
  enabled: true, // true para ativar, false para desativar
  webhookUrl: "https://discord.com/api/webhooks/YOUR_WEBHOOK_URL"
}
```

### Tipos de Notificações

O sistema enviará notificações do Discord quando:

- ❌ **Falha ao acessar arquivo de backup**: quando o arquivo de backup não pode ser lido
- ❌ **Falha no upload**: quando o upload para o storage falha
- ❌ **Erro crítico**: quando ocorre um erro geral no processo de backup

Cada notificação inclui:
- Nome do banco de dados
- Engine utilizada (MySQL, PostgreSQL, etc)
- Mensagem de erro detalhada
- Nome do arquivo de backup (quando aplicável)
- Timestamp da ocorrência

### Desativar Notificações

Para desativar as notificações do Discord, basta definir `enabled: false` ou remover a configuração `discord` do `config.js`.

## Exemplos de Configuração de Banco de Dados

### MySQL (Local)

```javascript
{
  engine: "mysql",
  isDocker: false,
  host: "127.0.0.1",
  user: "root",
  port: "3306",
  password: "sua-senha",
  databases: ["banco1", "banco2"]
}
```

### MySQL (Docker)

```javascript
{
  engine: "mysql",
  isDocker: true,
  dockerImage: "nome-do-container-mysql",
  host: "localhost",
  user: "root",
  port: "3306",
  password: "sua-senha",
  databases: ["banco1", "banco2"]
}
```

### PostgreSQL (Docker)

```javascript
{
  engine: "pg",
  isDocker: true,
  dockerImage: "nome-do-container-postgres",
  user: "postgres",
  databases: ["banco1", "banco2"]
}
```

### MongoDB (Docker)

```javascript
{
  engine: "mongo",
  isDocker: true,
  dockerImage: "nome-do-container-mongo",
  host: "localhost",
  port: "27017",
  user: "admin",
  password: "sua-senha",
  databases: ["banco1", "banco2"]
}
```

## Uso com PM2 (Recomendado para produção)

Para execução em produção com agendamento automático via cron rodando em background, recomendamos o uso do PM2. Para saber mais sobre ele clique [aqui](http://pm2.keymetrics.io/docs/usage/quick-start/)

### 🚀 Como rodar o s3-backup com PM2?

```bash
# 1. Instalar PM2 (se ainda não tiver)
npm install -g pm2

# 2. Rodar com file de config padrão (config.js na raiz)
pm2 start index.js --name=s3-backup

# 3. OU rodar com config customizada usando --daemon
pm2 start npx --name="s3-backup" -- s3-backup --daemon --config ./my-config.js

# O processo fica rodando em background com o cron ativo!
# Você pode fechar o terminal que continua rodando
```

### Qual a diferença?

**Sem `--daemon`** (execução única):
```bash
npx s3-backup --config ./config.js
# Executa UM backup e termina
```

**Com `--daemon`** (modo agendado):
```bash
pm2 start npx --name s3-backup -- s3-backup --daemon --config ./config.js
# Inicia o agendador cron e fica rodando em background
# Executa backups automaticamente nos horários configurados
```

### Exemplos de Uso

#### Uso Básico com config.js na raiz
```bash
pm2 start index.js --name=s3-backup
```

#### Com arquivo de configuração customizado
```bash
pm2 start npx --name="s3-backup-prod" -- s3-backup --daemon --config ./production.config.js
pm2 start npx --name="s3-backup-staging" -- s3-backup --daemon --config ./staging.config.js
```

#### Rodar várias instâncias com configs diferentes
```bash
# Produção
pm2 start npx --name="backup-prod" -- s3-backup --daemon --config /etc/s3-backup/prod.js

# Staging  
pm2 start npx --name="backup-staging" -- s3-backup --daemon --config /etc/s3-backup/staging.js

# Development
pm2 start npx --name="backup-dev" -- s3-backup --daemon --config ./config.dev.js
```

### Configurar para Iniciar no Boot do Sistema

Para garantir que o backup inicie automaticamente quando o servidor reiniciar:

```bash
# Gerar script de inicialização no boot
pm2 startup

# Executar o comando que o PM2 exibir (será algo como):
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u seu-usuario --hp /home/seu-usuario

# Salvar a lista atual de processos para restaurar no boot
pm2 save
```

Agora seu backup rodará em background e será reiniciado automaticamente:
- ✅ Se o processo falhar
- ✅ Se o servidor reiniciar
- ✅ Se você fizer logout do terminal

### Comandos PM2 Úteis

```bash
pm2 start index.js --name=s3-backup    # Iniciar o agendador de backup
pm2 logs s3-backup                      # Ver logs em tempo real
pm2 logs s3-backup --lines 100          # Ver últimas 100 linhas de log
pm2 flush s3-backup                     # Limpar logs
pm2 restart s3-backup                   # Reiniciar o processo
pm2 reload s3-backup                    # Reload sem downtime
pm2 stop s3-backup                      # Parar o processo
pm2 delete s3-backup                    # Remover do PM2
pm2 list                                # Listar todos os processos
pm2 monit                               # Monitor interativo de processos
pm2 info s3-backup                      # Informações detalhadas do processo
pm2 save                                # Salvar lista de processos atual
```

### Gerenciar Múltiplos Processos (Quando usar várias configs)

```bash
# Iniciar processos específicos do ecosystem.config.js
pm2 start ecosystem.config.js --only s3-backup-production
pm2 start ecosystem.config.js --only s3-backup-staging

# Ver logs de um processo específico
pm2 logs s3-backup-production
pm2 logs s3-backup-staging

# Reiniciar apenas um processo
pm2 restart s3-backup-production

# Parar todos os processos de backup
pm2 stop all

# Deletar todos os processos de backup
pm2 delete all

# Ver tabela com todos os processos
pm2 list
```

### Verificar se está Rodando em Background

```bash
# Listar processos
pm2 list

# Ver status detalhado
pm2 show s3-backup

# Verificar logs
pm2 logs s3-backup --lines 50
```

### Configuração Avançada com Arquivo de Ecosystem

Crie um arquivo `ecosystem.config.js` na raiz do projeto:

```javascript
module.exports = {
  apps: [{
    name: 's3-backup',
    script: './index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
```

E inicie com:

```bash
pm2 start ecosystem.config.js
```

## Variáveis de Ambiente

Você pode usar um arquivo `.env` para dados sensíveis:

```bash
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
DISCORD_WEBHOOK_URL=your-webhook-url
```

E referenciá-los no seu config:

```javascript
require('dotenv').config()

module.exports = {
  discord: {
    enabled: true,
    webhookUrl: process.env.DISCORD_WEBHOOK_URL
  },
  s3Default: {
    key: process.env.S3_ACCESS_KEY,
    secret: process.env.S3_SECRET_KEY,
    region: "us-east-1",
    bucket: "your-bucket"
  }
}
```

## Resolução de Problemas

### Erro: mysqldump not found

Instale as ferramentas cliente do MySQL:
```bash
# Ubuntu/Debian
sudo apt-get install mysql-client

# macOS
brew install mysql-client
```

### Erro: pg_dump not found

Instale as ferramentas cliente do PostgreSQL:
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql
```

### Falha no upload para Cloudflare R2

Verifique se:
- A URL do endpoint inclui seu account ID
- A região está definida como `"auto"`
- Seu bucket tem as permissões corretas

### Notificações Discord não funcionam

Verifique:
- A URL do webhook está correta e ativa
- O flag `enabled` está definido como `true`
- Seu servidor tem acesso à internet para o Discord

## Licença

ISC

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para enviar um Pull Request.

## Autor

Igor Trindade

## Suporte

Se você encontrar problemas ou tiver dúvidas, por favor abra uma issue no GitHub.
