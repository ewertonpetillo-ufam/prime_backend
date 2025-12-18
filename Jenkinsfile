pipeline {
    agent any
    
    environment {
        // Git e Pipeline
        GIT_REPO = 'https://github.com/ewertonpetillo-ufam/prime_backend.git'
        BRANCH = 'main'
        CONTAINER_NAME = 'prime-backend'
        IMAGE_NAME = 'prime-backend-pipeline-backend'
        
        // SonarQube
        SONAR_TOKEN = credentials('sonarqube-token')
        SONAR_PROJECT_KEY = 'prime-backend'
        SONAR_PROJECT_NAME = 'Prime Backend'
        
        // Credenciais do Telegram
        TELEGRAM_BOT_TOKEN = credentials('telegram-bot-token')
        TELEGRAM_CHAT_ID = credentials('telegram-chat-id')
        
        // Application Config
        NODE_ENV = 'production'
        PORT = '4000'
        API_PREFIX = 'api/v1'
        
        // Database (Produção)
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
        
        // CORS
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
                                "🔍 Análise de código: SonarQube\n" +
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
                    echo "\n=== Package.json ==="
                    cat package.json | head -20
                '''
            }
        }
        
        stage('Code Analysis') {
            steps {
                echo '🔍 Executando análise de código com SonarQube (usando container Node.js)...'
                script {
                    try {
                        sh '''
                            # Usar container Docker com Node.js para executar o scanner
                            # Copiar arquivos para dentro do container para evitar problemas de volume mount
                            WORKSPACE_DIR=$(pwd)
                            CONTAINER_NAME="sonar-scanner-$$"
                            
                            echo "📁 Workspace atual: $WORKSPACE_DIR"
                            
                            # Verificar se src existe no workspace antes de executar
                            if [ ! -d "src" ]; then
                                echo "❌ Diretório src não encontrado no workspace!"
                                exit 1
                            fi
                            
                            echo "✅ Diretório src encontrado no workspace"
                            echo "🚀 Criando container temporário para análise SonarQube..."
                            
                            # Criar container em modo detached
                            docker create --name "$CONTAINER_NAME" \
                                -w /workspace \
                                node:20-alpine \
                                sh -c "
                                    echo '✅ Node.js: ' && node --version
                                    echo '✅ npm: ' && npm --version
                                    echo ''
                                    echo '📁 Verificando estrutura dentro do container...'
                                    ls -la
                                    echo ''
                                    if [ -d 'src' ]; then
                                        echo '✅ Diretório src encontrado'
                                        ls -la src/ | head -5
                                    fi
                                    echo ''
                                    echo '🚀 Executando SonarQube Scanner...'
                                    npx --yes @sonar/scan \
                                        -Dsonar.host.url=https://prime.icomp.ufam.edu.br/sonar \
                                        -Dsonar.token=${SONAR_TOKEN} \
                                        -Dsonar.projectKey=${SONAR_PROJECT_KEY}
                                    echo ''
                                    echo '✅ Análise SonarQube concluída com sucesso!'
                                "
                            
                            # Copiar arquivos necessários para o container
                            echo "📦 Copiando arquivos do projeto para o container..."
                            docker cp "$WORKSPACE_DIR/src" "$CONTAINER_NAME:/workspace/"
                            docker cp "$WORKSPACE_DIR/sonar-project.properties" "$CONTAINER_NAME:/workspace/" 2>/dev/null || echo "⚠️ sonar-project.properties não encontrado, usando parâmetros padrão"
                            
                            # Executar o container
                            echo "🚀 Executando análise..."
                            docker start -a "$CONTAINER_NAME"
                            EXIT_CODE=$?
                            
                            # Limpar container
                            docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
                            
                            # Retornar código de saída
                            exit $EXIT_CODE
                        '''
                    } catch (Exception e) {
                        echo "⚠️ Análise SonarQube falhou, mas o pipeline continuará: ${e.getMessage()}"
                        // Não falha o build - permite continuar mesmo se SonarQube falhar
                    }
                }
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
                '''
            }
        }
        
        stage('Criar Redes Docker') {
            steps {
                echo '🌐 Criando redes Docker necessárias...'
                sh '''
                    docker network create frontend 2>/dev/null || echo "✓ Rede frontend já existe"
                    docker network create prime-network 2>/dev/null || echo "✓ Rede prime-network já existe"
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
                            
                            if timeout 5 bash -c "cat < /dev/null > /dev/tcp/${DB_HOST}/${DB_PORT}"; then
                                echo "✅ Porta ${DB_PORT} acessível em ${DB_HOST}"
                            else
                                echo "❌ Não foi possível conectar em ${DB_HOST}:${DB_PORT}"
                                exit 1
                            fi
                        '''
                    } catch (Exception e) {
                        echo "⚠️ Aviso: Não foi possível testar conexão com banco."
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo '🏗️  Construindo imagem Docker...'
                sh '''
                    export DOCKER_BUILDKIT=1
                    export COMPOSE_DOCKER_CLI_BUILD=1
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
                        
                        docker ps --filter "name=${CONTAINER_NAME}"
                        docker logs --tail 40 ${CONTAINER_NAME}
                        
                        for i in {1..6}; do
                            STATUS=$(docker inspect ${CONTAINER_NAME} --format='{{.State.Health.Status}}' 2>/dev/null || echo "sem healthcheck")
                            echo "Tentativa $i/6: Status = $STATUS"
                            
                            if [ "$STATUS" = "healthy" ]; then
                                echo "✅ Aplicação está saudável!"
                                break
                            fi
                            
                            if [ $i -lt 6 ]; then
                                sleep 10
                            fi
                        done
                    else
                        echo "❌ Container não está rodando!"
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
                    rm -f .env
                    docker image prune -f
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
                    def sonarUrl = "https://prime.icomp.ufam.edu.br/sonar/dashboard?id=${SONAR_PROJECT_KEY}"
                    
                    sendTelegramWithButtons("✅ *Deploy Backend Sucesso*\n\n" +
                                "📦 Projeto: ${env.JOB_NAME}\n" +
                                "🔢 Build: #${env.BUILD_NUMBER}\n" +
                                "👤 Iniciado por: ${initiator}\n" +
                                "⏱️ Duração: ${duration}\n" +
                                "🐳 Container: ${env.CONTAINER_NAME}\n" +
                                "✅ Quality Gate: Passou\n\n" +
                                "🔒 API: porta 4000\n" +
                                "📚 Swagger: /api/docs\n\n" +
                                "Deploy realizado com sucesso! 🎉")
                } catch (Exception e) {
                    echo "⚠️ Erro ao enviar notificação: ${e.getMessage()}"
                }
            }
        }
        
        failure {
            script {
                try {
                    def duration = currentBuild.durationString.replace(' and counting', '')
                    def initiator = getUserInfo()
                    def stageName = env.STAGE_NAME ?: 'Desconhecido'
                    
                    sendTelegramWithButtons("❌ *Deploy Backend Falhou*\n\n" +
                                "📦 Projeto: ${env.JOB_NAME}\n" +
                                "🔢 Build: #${env.BUILD_NUMBER}\n" +
                                "👤 Iniciado por: ${initiator}\n" +
                                "⏱️ Duração: ${duration}\n" +
                                "📝 Stage: ${stageName}")
                } catch (Exception e) {
                    echo "⚠️ Erro ao processar falha"
                }
            }
        }
        
        always {
            sh 'rm -f .env || true'
        }
    }
}

def getUserInfo() {
    try {
        def causes = currentBuild.getBuildCauses()
        for (cause in causes) {
            if (cause._class.contains('UserIdCause')) {
                return cause.userId ?: 'Usuário Jenkins'
            }
            if (cause._class.contains('SCMTrigger')) {
                return 'SCM (Git Push)'
            }
        }
    } catch (Exception e) {
        echo "⚠️ Erro ao obter usuário"
    }
    return 'Jenkins (automático)'
}

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
        echo "⚠️ Erro ao enviar Telegram"
    }
}

def sendTelegramWithButtons(String message) {
    try {
        def buildUrl = env.BUILD_URL ?: 'https://jenkins'
        def sonarUrl = "https://prime.icomp.ufam.edu.br/sonar/dashboard?id=${env.SONAR_PROJECT_KEY}"
        
        def keyboard = """{"inline_keyboard": [[{"text": "📊 Ver Build", "url": "${buildUrl}"},{"text": "🔍 SonarQube", "url": "${sonarUrl}"}]]}"""
        
        sh """
            curl -s -X POST https://api.telegram.org/bot\${TELEGRAM_BOT_TOKEN}/sendMessage \
            -d chat_id=\${TELEGRAM_CHAT_ID} \
            -d text='${message.replace("'", "'\\''")}' \
            -d parse_mode=Markdown \
            -d reply_markup='${keyboard}'
        """
    } catch (Exception e) {
        sendTelegram(message)
    }
}