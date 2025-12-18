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
                    echo "\n=== Dockerfile ==="
                    cat Dockerfile
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '📦 Instalando dependências para análise...'
                sh '''
                    # Instalar dependências sem buildar (mais rápido)
                    npm ci --prefer-offline --no-audit
                    echo "✅ Dependências instaladas"
                '''
            }
        }
        
        stage('Lint & Tests') {
            steps {
                echo '🧪 Executando testes e coverage...'
                sh '''
                    # Executar testes com coverage
                    npm run test:cov || true
                    
                    echo "\n=== Coverage gerado ==="
                    if [ -d "coverage" ]; then
                        ls -la coverage/
                        if [ -f "coverage/lcov.info" ]; then
                            echo "✅ Arquivo lcov.info gerado com sucesso"
                        else
                            echo "⚠️ lcov.info não foi gerado"
                        fi
                    else
                        echo "⚠️ Diretório coverage não foi criado"
                    fi
                '''
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                echo '🔍 Analisando código com SonarQube...'
                script {
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                            -Dsonar.projectName='${SONAR_PROJECT_NAME}' \
                            -Dsonar.sources=src \
                            -Dsonar.tests=src,test \
                            -Dsonar.test.inclusions=**/*.spec.ts,**/*.test.ts \
                            -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**,**/*.spec.ts,**/*.test.ts \
                            -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info \
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                        """
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                echo '🚦 Verificando Quality Gate...'
                script {
                    timeout(time: 5, unit: 'MINUTES') {
                        try {
                            def qg = waitForQualityGate()
                            if (qg.status != 'OK') {
                                def sonarUrl = "https://prime.icomp.ufam.edu.br/sonar/dashboard?id=${SONAR_PROJECT_KEY}"
                                sendTelegram("⚠️ *Quality Gate Falhou*\n\n" +
                                           "📦 Projeto: ${env.JOB_NAME}\n" +
                                           "🔢 Build: #${env.BUILD_NUMBER}\n" +
                                           "❌ Status: ${qg.status}\n\n" +
                                           "🔗 [Ver no SonarQube](${sonarUrl})")
                                
                                error "Quality Gate falhou: ${qg.status}"
                            } else {
                                echo "✅ Quality Gate passou!"
                            }
                        } catch (Exception e) {
                            echo "⚠️ Erro ao verificar Quality Gate: ${e.getMessage()}"
                            throw e
                        }
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
                        
                        echo "\n=== Testando endpoint /api/v1 ==="
                        if docker exec ${CONTAINER_NAME} wget --quiet --tries=1 --spider http://localhost:4000/api/v1 2>&1; then
                            echo "✅ API respondendo em /api/v1"
                        else
                            echo "⚠️  Endpoint /api/v1 ainda não está respondendo"
                        fi
                        
                        echo "\n=== Testando Swagger Docs ==="
                        if docker exec ${CONTAINER_NAME} wget --quiet --tries=1 --spider http://localhost:4000/api/docs 2>&1; then
                            echo "✅ Swagger disponível em /api/docs"
                        else
                            echo "ℹ️  Swagger não disponível"
                        fi
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
                    
                    echo "\n=== Containers Prime Ativos ==="
                    docker ps --filter "name=prime" --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"
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
                                "🐘 Database: ${env.DB_HOST}\n" +
                                "✅ Quality Gate: Passou\n\n" +
                                "🔒 API: porta 4000\n" +
                                "📚 Swagger: /api/docs\n" +
                                "🔍 [Ver Análise SonarQube](${sonarUrl})\n\n" +
                                "Deploy realizado com sucesso! 🎉")
                } catch (Exception e) {
                    echo "⚠️ Erro ao enviar notificação: ${e.getMessage()}"
                }
            }
            echo '✅ Pipeline executado com sucesso!'
        }
        
        failure {
            script {
                try {
                    def duration = currentBuild.durationString.replace(' and counting', '')
                    def initiator = getUserInfo()
                    def stageName = env.STAGE_NAME ?: 'Desconhecido'
                    def sonarUrl = "https://prime.icomp.ufam.edu.br/sonar/dashboard?id=${SONAR_PROJECT_KEY}"
                    
                    def errorMessage = "❌ *Deploy Backend Falhou*\n\n" +
                                "📦 Projeto: ${env.JOB_NAME}\n" +
                                "🔢 Build: #${env.BUILD_NUMBER}\n" +
                                "👤 Iniciado por: ${initiator}\n" +
                                "⏱️ Duração: ${duration}\n" +
                                "📝 Stage: ${stageName}\n"
                    
                    // Se falhou no Quality Gate, adicionar link do SonarQube
                    if (stageName == 'Quality Gate') {
                        errorMessage += "\n🔍 [Ver Detalhes no SonarQube](${sonarUrl})"
                    }
                    
                    sendTelegramWithButtons(errorMessage)
                } catch (Exception e) {
                    echo "⚠️ Erro ao processar falha: ${e.getMessage()}"
                }
            }
            echo '❌ Pipeline falhou!'
        }
        
        always {
            script {
                echo '📊 Execução finalizada'
                try {
                    sh 'rm -f .env || true'
                } catch (Exception e) {
                    echo '⚠️ Não foi possível remover .env'
                }
            }
        }
    }
}

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
        }
    } catch (Exception e) {
        echo "⚠️ Erro ao obter informações do usuário"
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
        echo "⚠️ Erro ao enviar mensagem Telegram"
    }
}

def sendTelegramWithButtons(String message) {
    try {
        def buildUrl = env.BUILD_URL ?: 'https://jenkins'
        def sonarUrl = "https://prime.icomp.ufam.edu.br/sonar/dashboard?id=${env.SONAR_PROJECT_KEY}"
        
        def keyboard = """
        {
            "inline_keyboard": [[
                {"text": "📊 Ver Build", "url": "${buildUrl}"},
                {"text": "🔍 SonarQube", "url": "${sonarUrl}"}
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
        echo "⚠️ Erro ao enviar mensagem com botões"
        sendTelegram(message)
    }
}