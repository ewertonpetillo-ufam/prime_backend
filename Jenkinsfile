pipeline {
    agent any
    
    environment {
        GIT_REPO = 'https://github.com/ewertonpetillo-ufam/prime.git'
        BRANCH = 'main'
        CONTAINER_NAME = 'prime-backend'
        IMAGE_NAME = 'prime-backend-pipeline-backend'
        
        // Credenciais do Telegram
        TELEGRAM_BOT_TOKEN = credentials('telegram-bot-token')
        TELEGRAM_CHAT_ID = credentials('telegram-chat-id')
    }
    
    triggers {
        pollSCM('H/5 * * * *')
    }
    
    stages {
        stage('Notify Start') {
            steps {
                script {
                    sendTelegram("🔔 *Build Iniciado*\n\n" +
                                "📦 Projeto: ${env.JOB_NAME}\n" +
                                "🔢 Build: #${env.BUILD_NUMBER}\n" +
                                "👤 Iniciado por: ${env.BUILD_USER ?: 'Jenkins'}\n" +
                                "🌿 Branch: ${BRANCH}")
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
                    cat Dockerfile
                    cat docker-compose.yml
                '''
            }
        }
        
        stage('Criar Redes Docker') {
            steps {
                echo '🌐 Criando redes Docker necessárias...'
                sh '''
                    docker network create frontend 2>/dev/null || true
                    docker network create prime-network 2>/dev/null || true
                    echo "✅ Redes Docker verificadas/criadas"
                '''
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
                echo '🚀 Subindo nova versão da aplicação...'
                sh '''
                    docker compose up -d
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '🏥 Verificando se a aplicação subiu...'
                sh '''
                    echo "Aguardando 30 segundos para inicialização..."
                    sleep 30
                    
                    if docker ps | grep -q ${CONTAINER_NAME}; then
                        echo "✅ Container está rodando"
                        docker logs --tail 30 ${CONTAINER_NAME}
                        
                        # Verificar healthcheck do backend
                        echo "Verificando healthcheck..."
                        docker inspect ${CONTAINER_NAME} --format='{{.State.Health.Status}}' || echo "Healthcheck ainda não disponível"
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
                echo '🧹 Limpando imagens antigas...'
                sh '''
                    docker image prune -f
                    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
                '''
            }
        }
    }
    
    post {
        success {
            script {
                def duration = currentBuild.durationString.replace(' and counting', '')
                sendTelegramWithButtons("✅ *Build Sucesso*\n\n" +
                            "📦 Projeto: ${env.JOB_NAME}\n" +
                            "🔢 Build: #${env.BUILD_NUMBER}\n" +
                            "⏱️ Duração: ${duration}\n" +
                            "🐳 Container: ${CONTAINER_NAME}\n\n" +
                            "Deploy realizado com sucesso! 🎉")
            }
            echo '✅ Pipeline executado com sucesso!'
        }
        
        failure {
            script {
                def duration = currentBuild.durationString.replace(' and counting', '')
                def logOutput = sh(
                    script: "docker logs ${CONTAINER_NAME} 2>&1 | tail -20 || echo 'Sem logs disponíveis'",
                    returnStdout: true
                ).trim()
                
                sendTelegramWithButtons("❌ *Build Falhou*\n\n" +
                            "📦 Projeto: ${env.JOB_NAME}\n" +
                            "🔢 Build: #${env.BUILD_NUMBER}\n" +
                            "⏱️ Duração: ${duration}\n" +
                            "📝 Stage: ${env.STAGE_NAME}\n\n" +
                            "```\n${logOutput}\n```")
            }
            echo '❌ Pipeline falhou!'
        }
        
        always {
            echo '📊 Execução finalizada'
        }
    }
}

// Função para enviar mensagens no Telegram
def sendTelegram(String message) {
    sh """
        curl -s -X POST https://api.telegram.org/bot\${TELEGRAM_BOT_TOKEN}/sendMessage \
        -d chat_id=\${TELEGRAM_CHAT_ID} \
        -d text='${message}' \
        -d parse_mode=Markdown \
        -d disable_web_page_preview=true
    """
}

// Função para enviar mensagens com botões
def sendTelegramWithButtons(String message) {
    def keyboard = """
    {
        "inline_keyboard": [[
            {"text": "📊 Ver Build", "url": "${env.BUILD_URL}"}
        ]]
    }
    """
    
    sh """
        curl -s -X POST https://api.telegram.org/bot\${TELEGRAM_BOT_TOKEN}/sendMessage \
        -d chat_id=\${TELEGRAM_CHAT_ID} \
        -d text='${message}' \
        -d parse_mode=Markdown \
        -d reply_markup='${keyboard}'
    """
}

