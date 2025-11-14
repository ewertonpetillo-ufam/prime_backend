pipeline {
    agent any
    
    environment {
        // Git e Pipeline
        GIT_REPO = 'https://github.com/ewertonpetillo-ufam/prime_backend.git'
        BRANCH = 'main'
        CONTAINER_NAME = 'prime-backend'
        IMAGE_NAME = 'prime-backend-pipeline-backend'
        
        // Credenciais do Telegram
        TELEGRAM_BOT_TOKEN = credentials('telegram-bot-token')
        TELEGRAM_CHAT_ID = credentials('telegram-chat-id')
        
        // Application Config
        NODE_ENV = 'production'
        PORT = '4000'
        API_PREFIX = 'api/v1'
        
        // Database (Produção)
        // IMPORTANTE: Configure todas as credenciais no Jenkins antes de executar
        DB_HOST = credentials('prime-db-host')
        DB_PORT = '5432'
        DB_USERNAME = credentials('prime-db-username')
        DB_PASSWORD = credentials('prime-db-password')
        DB_DATABASE = credentials('prime-db-name')
        
        // JWT Authentication
        JWT_SECRET = credentials('prime-jwt-secret')
        JWT_EXPIRATION = '24h'
        
        // Client Credentials
        CLIENT_1_ID = credentials('prime-client1-id')
        CLIENT_1_SECRET = credentials('prime-client1-secret')
        CLIENT_2_ID = credentials('prime-client2-id')
        CLIENT_2_SECRET = credentials('prime-client2-secret')
        
        // HMAC for CPF Anonymization
        HMAC_SECRET = credentials('prime-hmac-secret')
        
        // Swagger Documentation
        ENABLE_SWAGGER = 'true'
        SWAGGER_USERNAME = credentials('prime-swagger-username')
        SWAGGER_PASSWORD = credentials('prime-swagger-password')
        
        // CORS - Múltiplas origens separadas por vírgula
        // Inclui frontend interno (container) e URL pública
        CORS_ORIGIN = 'http://nextjs-prime:3000,https://prime.icomp.ufam.edu.br'
    }
    
    triggers {
        pollSCM('H/5 * * * *')
    }
    
    stages {
        stage('Notify Start') {
            steps {
                script {
                    def initiator = getUserInfo()
                    
                    sendTelegram("🔔 *Build Backend Iniciado*\n\n" +
                                "📦 Projeto: ${env.JOB_NAME}\n" +
                                "🔢 Build: #${env.BUILD_NUMBER}\n" +
                                "👤 Iniciado por: ${initiator}\n" +
                                "🌿 Branch: ${BRANCH}\n" +
                                "🐘 Database: ${env.DB_HOST}\n" +
                                "🔒 API: porta 4000 (acesso via VPN)")
                }
            }
        }
        
        stage('Checkout') {
            steps {
                echo '📦 Clonando repositório do GitHub...'
                git branch: "${BRANCH}",
                    credentialsId: 'github-token',
                    url: "${GIT_REPO}"
            }
        }
        
        stage('Verificar Arquivos') {
            steps {
                echo '🔍 Verificando estrutura do projeto...'
                sh '''
                    ls -la
                    echo "\n=== Dockerfile ==="
                    cat Dockerfile
                    echo "\n=== docker-compose.yml ==="
                    cat docker-compose.yml
                '''
            }
        }
        
        stage('Criar .env') {
            steps {
                echo '🔐 Criando arquivo .env com credenciais de produção...'
                sh '''
                    cat > .env << EOF
# Application
NODE_ENV=${NODE_ENV}
PORT=${PORT}
API_PREFIX=${API_PREFIX}

# Database (Produção)
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
DB_DATABASE=${DB_DATABASE}

# JWT Authentication
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=${JWT_EXPIRATION}

# Client Credentials for JWT
CLIENT_1_ID=${CLIENT_1_ID}
CLIENT_1_SECRET=${CLIENT_1_SECRET}
CLIENT_2_ID=${CLIENT_2_ID}
CLIENT_2_SECRET=${CLIENT_2_SECRET}

# HMAC for CPF Anonymization
HMAC_SECRET=${HMAC_SECRET}

# Swagger Documentation
ENABLE_SWAGGER=${ENABLE_SWAGGER}
SWAGGER_USERNAME=${SWAGGER_USERNAME}
SWAGGER_PASSWORD=${SWAGGER_PASSWORD}

# CORS
CORS_ORIGIN=${CORS_ORIGIN}
EOF
                    
                    echo "✅ Arquivo .env criado"
                    echo "\n=== Variáveis configuradas (sem senhas) ==="
                    grep -v "PASSWORD\\|SECRET\\|_SECRET" .env || echo "Todas as variáveis sensíveis configuradas"
                '''
            }
        }
        
        stage('Criar Redes Docker') {
            steps {
                echo '🌐 Criando redes Docker necessárias...'
                sh '''
                    docker network create frontend 2>/dev/null || echo "✓ Rede frontend já existe"
                    docker network create prime-network 2>/dev/null || echo "✓ Rede prime-network já existe"
                    
                    echo "\n=== Redes Docker disponíveis ==="
                    docker network ls | grep -E "frontend|prime-network"
                '''
            }
        }
        
        stage('Testar Conexão com Banco') {
            steps {
                echo '🐘 Testando conexão com banco de dados de produção...'
                script {
                    try {
                        sh '''
                            echo "Testando conectividade com ${DB_HOST}:${DB_PORT}..."
                            
                            # Testar se a porta está acessível
                            if timeout 5 bash -c "cat < /dev/null > /dev/tcp/${DB_HOST}/${DB_PORT}"; then
                                echo "✅ Porta ${DB_PORT} acessível em ${DB_HOST}"
                            else
                                echo "❌ Não foi possível conectar em ${DB_HOST}:${DB_PORT}"
                                echo "Verifique se o banco está rodando e se há firewall bloqueando"
                                exit 1
                            fi
                        '''
                    } catch (Exception e) {
                        echo "⚠️ Aviso: Não foi possível testar conexão com banco. Continuando mesmo assim..."
                        echo "Erro: ${e.getMessage()}"
                        // Não falha o build se não conseguir testar a conexão
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo '🏗️  Construindo imagem Docker...'
                sh '''
                    docker compose build --no-cache
                '''
            }
        }
        
        stage('Stop Old Container') {
            steps {
                echo '🛑 Parando e removendo container antigo...'
                sh '''
                    docker stop ${CONTAINER_NAME} 2>/dev/null || true
                    docker rm -f ${CONTAINER_NAME} 2>/dev/null || true
                    echo "✅ Container antigo removido"
                '''
            }
        }
        
        stage('Deploy') {
            steps {
                echo '🚀 Subindo nova versão do backend...'
                sh '''
                    docker compose up -d
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '🏥 Verificando se a aplicação subiu...'
                sh '''
                    echo "Aguardando 40 segundos para inicialização completa..."
                    sleep 40
                    
                    if docker ps | grep -q ${CONTAINER_NAME}; then
                        echo "✅ Container está rodando"
                        
                        echo "\n=== Status do Container ==="
                        docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"
                        
                        echo "\n=== Últimas 40 linhas do log ==="
                        docker logs --tail 40 ${CONTAINER_NAME}
                        
                        echo "\n=== Verificando Healthcheck ==="
                        for i in {1..6}; do
                            STATUS=$(docker inspect ${CONTAINER_NAME} --format='{{.State.Health.Status}}' 2>/dev/null || echo "sem healthcheck")
                            echo "Tentativa $i/6: Status = $STATUS"
                            
                            if [ "$STATUS" = "healthy" ]; then
                                echo "✅ Aplicação está saudável!"
                                break
                            fi
                            
                            if [ $i -lt 6 ]; then
                                echo "Aguardando mais 10 segundos..."
                                sleep 10
                            fi
                        done
                        
                        # Testar endpoint da API
                        echo "\n=== Testando endpoint /api/v1 ==="
                        if docker exec ${CONTAINER_NAME} wget --quiet --tries=1 --spider http://localhost:4000/api/v1 2>&1; then
                            echo "✅ API respondendo em /api/v1"
                        else
                            echo "⚠️  Endpoint /api/v1 ainda não está respondendo"
                        fi
                        
                        # Testar Swagger (se disponível)
                        echo "\n=== Testando Swagger Docs ==="
                        if docker exec ${CONTAINER_NAME} wget --quiet --tries=1 --spider http://localhost:4000/api/docs 2>&1; then
                            echo "✅ Swagger disponível em /api/docs"
                        else
                            echo "ℹ️  Swagger não disponível ou endpoint diferente"
                        fi
                    else
                        echo "❌ Container não está rodando!"
                        echo "\n=== Logs do container ==="
                        docker logs ${CONTAINER_NAME} 2>&1 || true
                        exit 1
                    fi
                '''
            }
        }
        
        stage('Cleanup') {
            steps {
                echo '🧹 Limpando recursos...'
                sh '''
                    # Remove arquivo .env por segurança
                    rm -f .env
                    
                    # Remove imagens antigas
                    docker image prune -f
                    
                    echo "\n=== Containers Prime Ativos ==="
                    docker ps --filter "name=prime" --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"
                    
                    echo "\n=== Uso de recursos do container ==="
                    docker stats ${CONTAINER_NAME} --no-stream --format "table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}"
                '''
            }
        }
    }
    
    post {
        success {
            script {
                try {
                    def duration = currentBuild.durationString.replace(' and counting', '')
                    def initiator = getUserInfo()
                    
                    sendTelegramWithButtons("✅ *Deploy Backend Sucesso*\n\n" +
                                "📦 Projeto: ${env.JOB_NAME}\n" +
                                "🔢 Build: #${env.BUILD_NUMBER}\n" +
                                "👤 Iniciado por: ${initiator}\n" +
                                "⏱️ Duração: ${duration}\n" +
                                "🐳 Container: ${env.CONTAINER_NAME}\n" +
                                "🐘 Database: ${env.DB_HOST}\n\n" +
                                "🔒 API disponível na porta 4000\n" +
                                "📚 Swagger: /api/docs\n\n" +
                                "Deploy realizado com sucesso! 🎉")
                } catch (Exception e) {
                    echo "⚠️ Erro ao enviar notificação Telegram: ${e.getMessage()}"
                }
            }
            echo '✅ Pipeline executado com sucesso!'
        }
        
        failure {
            script {
                try {
                    def duration = currentBuild.durationString.replace(' and counting', '')
                    def initiator = getUserInfo()
                    def containerName = env.CONTAINER_NAME ?: 'prime-backend'
                    def logOutput = ''
                    
                    // Tentar obter logs apenas se estiver em contexto de node
                    try {
                        logOutput = sh(
                            script: "docker logs ${containerName} 2>&1 | tail -30 || echo 'Sem logs disponíveis'",
                            returnStdout: true
                        ).trim()
                    } catch (Exception e) {
                        logOutput = 'Logs não disponíveis (container pode não existir ou sem contexto de node)'
                    }
                    
                    def errorMessage = "❌ *Deploy Backend Falhou*\n\n" +
                                "📦 Projeto: ${env.JOB_NAME}\n" +
                                "🔢 Build: #${env.BUILD_NUMBER}\n" +
                                "👤 Iniciado por: ${initiator}\n" +
                                "⏱️ Duração: ${duration}\n" +
                                "📝 Stage: ${env.STAGE_NAME ?: 'Desconhecido'}\n"
                    
                    if (logOutput) {
                        errorMessage += "\n```\n${logOutput}\n```"
                    }
                    
                    sendTelegramWithButtons(errorMessage)
                } catch (Exception e) {
                    echo "⚠️ Erro ao processar falha: ${e.getMessage()}"
                    // Tentar enviar mensagem simples sem logs
                    try {
                        sendTelegram("❌ *Deploy Backend Falhou*\n\n" +
                                    "📦 Projeto: ${env.JOB_NAME}\n" +
                                    "🔢 Build: #${env.BUILD_NUMBER}\n" +
                                    "Verifique os logs no Jenkins para mais detalhes.")
                    } catch (Exception e2) {
                        echo "⚠️ Não foi possível enviar notificação Telegram"
                    }
                }
            }
            echo '❌ Pipeline falhou!'
        }
        
        always {
            script {
                echo '📊 Execução finalizada'
                // Sempre remove o .env por segurança
                try {
                    sh 'rm -f .env || true'
                } catch (Exception e) {
                    echo '⚠️ Não foi possível remover .env (pode não existir)'
                }
            }
        }
    }
}

// Função para detectar quem iniciou o build
def getUserInfo() {
    try {
        def causes = currentBuild.getBuildCauses()
        
        for (cause in causes) {
            if (cause._class.contains('UserIdCause')) {
                return cause.userId ?: cause.userName ?: 'Usuário Jenkins'
            }
            if (cause._class.contains('SCMTrigger')) {
                try {
                    def gitAuthor = sh(
                        script: "git log -1 --pretty=format:'%an' 2>/dev/null || echo 'Git'",
                        returnStdout: true
                    ).trim()
                    return "SCM (Git Push por ${gitAuthor})"
                } catch (Exception e) {
                    return 'SCM (Git Push)'
                }
            }
            if (cause._class.contains('TimerTrigger')) {
                return 'Timer (Agendamento)'
            }
            if (cause._class.contains('UpstreamCause')) {
                return "Upstream (${cause.upstreamProject})"
            }
        }
    } catch (Exception e) {
        echo "⚠️ Erro ao obter informações do usuário: ${e.getMessage()}"
    }
    
    return 'Jenkins (automático)'
}

// Função para enviar mensagens no Telegram
def sendTelegram(String message) {
    try {
        sh """
            curl -s -X POST https://api.telegram.org/bot\${TELEGRAM_BOT_TOKEN}/sendMessage \
            -d chat_id=\${TELEGRAM_CHAT_ID} \
            -d text='${message.replace("'", "'\\''")}' \
            -d parse_mode=Markdown \
            -d disable_web_page_preview=true
        """
    } catch (Exception e) {
        echo "⚠️ Erro ao enviar mensagem Telegram: ${e.getMessage()}"
    }
}

// Função para enviar mensagens com botões
def sendTelegramWithButtons(String message) {
    try {
        def buildUrl = env.BUILD_URL ?: 'https://jenkins'
        def keyboard = """
        {
            "inline_keyboard": [[
                {"text": "📊 Ver Build", "url": "${buildUrl}"}
            ]]
        }
        """
        
        sh """
            curl -s -X POST https://api.telegram.org/bot\${TELEGRAM_BOT_TOKEN}/sendMessage \
            -d chat_id=\${TELEGRAM_CHAT_ID} \
            -d text='${message.replace("'", "'\\''")}' \
            -d parse_mode=Markdown \
            -d reply_markup='${keyboard}'
        """
    } catch (Exception e) {
        echo "⚠️ Erro ao enviar mensagem Telegram com botões: ${e.getMessage()}"
        // Tentar enviar sem botões como fallback
        try {
            sendTelegram(message)
        } catch (Exception e2) {
            echo "⚠️ Não foi possível enviar notificação Telegram"
        }
    }
}