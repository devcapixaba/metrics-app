
# 📖 README - Metrics app


## 🔧 Passos para execução

### 1. Clonar o repositório
Primeiro, clone o repositório do serviço principal.

```bash
git clone https://github.com/devcapixaba/metrics-app.git
cd main-ms
```

### 2. Instalar dependências
Instale as dependências do projeto.

```bash
npm install
```

### 3. Importe as collections do arquivo "Insomnia_metrics" fornecido na raiz do projeto

### 4. Crie um banco de dados "metrics" em uma instância postgres em localhost:5432 de acordo com as credenciais do arquivo typeorm-config.ts, ou altere-as.

### 5. Execute o projeto 

```bash
npm run start
```

### 6. Execute o endpoint fornecido POST http://localhost:3000/metrics/import para subir o arquivo e salvar as informações no banco de dados

### 7. Execute o endpoint fornecido GET http://localhost:3000/metrics/aggregate para retornar as informações agregadas

### 8. Execute o endpoint fornecido GET http://localhost:3000/metrics/report para realizar o download do arquivo

```bash
No insomnia, clique em "Download After Send" e escolha uma pasta. Em seguida, clique em "Send and Download" para efetuar o download do buffer em formato xlsx.
```

### 9. Execute os testes 

```bash
npm run test
```

### 10. Acessar o swagger doc

```bash
[http://localhost:3000/docs](http://localhost:3000/docs)
```