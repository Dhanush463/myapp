pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
  }

  triggers {
    pollSCM('H/2 * * * *')
  }

  environment {
    DOCKERHUB_USER = "sivadhanush8925"
    TAG            = "${env.BUILD_NUMBER}"
    KUBECONFIG     = '/var/lib/jenkins/.kube/config'
  }

  stages {
    stage('Build backend image') {
      steps {
        sh 'docker build -t $DOCKERHUB_USER/devops-backend:$TAG backend'
      }
    }

    stage('Build frontend image') {
      steps {
        sh 'docker build -t $DOCKERHUB_USER/devops-frontend:$TAG frontend'
      }
    }

    stage('Push images') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub',
                                          usernameVariable: 'DH_USER',
                                          passwordVariable: 'DH_PASS')]) {
          sh '''
            echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
            docker push $DOCKERHUB_USER/devops-backend:$TAG
            docker push $DOCKERHUB_USER/devops-frontend:$TAG
          '''
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        sh '''
          rm -rf .rendered && mkdir -p .rendered
          for f in k8s/app/*.yaml; do
            sed -e "s|DOCKERHUB_USER|$DOCKERHUB_USER|g" -e "s|IMAGE_TAG|$TAG|g" "$f" > ".rendered/$(basename "$f")"
          done
          kubectl apply -f .rendered/
          kubectl -n app rollout status deployment/backend --timeout=300s
          kubectl -n app rollout status deployment/frontend --timeout=180s
        '''
      }
    }
  }

  post {
    failure {
      sh 'kubectl -n app get pods -o wide || true'
    }
    always {
      sh '''
        docker logout || true
        docker image prune -af --filter "until=24h" || true
        docker builder prune -f --filter "until=48h" || true
      '''
    }
  }
}
