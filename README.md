## Objetivo

Esse programa tem como objetivo fazer o dump do banco de dados [mysql|postgres] e enviar para o Amazon S3.

## ⚠️ Versão 2.0.0 - Migração para AWS SDK v3

A partir da versão 2.0.0, este projeto foi atualizado para usar o AWS SDK v3, que oferece:
- Melhor performance e menor tamanho do bundle
- Arquitetura modular e tree-shaking
- Suporte aprimorado para TypeScript
- APIs mais modernas e consistentes

A configuração do S3 permanece a mesma, apenas a implementação interna foi modernizada.

## Instalação

Faça o clone desse repositório na sua máquina:

```
git clone https://github.com/igortrinidad/s3-backup
```

Instale as dependências:

```
npm install
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

Execute o `index.js`:

```
node index.js
```

### Recomendação

Recomendo a execução do `s3-backup` com o `pm2`. Para saber mais sobre ele clique [aqui](http://pm2.keymetrics.io/docs/usage/quick-start/)

Caso use o `pm2`:

```
pm2 start index.js --name=s3-backup
```

## Sobre

Para `Error Tracking` eu utilizo o `Sentry`. Para saber mais sobre ele clique [aqui](https://sentry.io)

