# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})

```
summaries removed (kutegea izo api's):
Group Loan Portfolio
Payment History
group analytics

Filters in Loans Management


<!-- //13th march meet before live -->

add member, search members not in any group //done
remove email group member  //done
relation ship manager pagination //done
Add loans issued to pagination & search. //done
Visualizations


remove summaries from pages //done

My created by //done
My managed. //done

remove edit loans and edit payment 

Groups page analytics (itarudishia api ikiwa ready wadau)
Business  page check it 

add member only list those not in groups
sanitize search
go live locally 

18th
wallet search // doen  but in personal  Joan Ouma does not work
comment out business //done
payment page pagination and search //done but Abraham Mbarak does not work


//Former .gitlab-ci.yml
image: node:20

services:
  - docker:20.10.16-dind

stages:
  - build
  - deploy

variables:
  DOCKER_IMAGE: $CI_REGISTRY_IMAGE

before_script:
  # 1) Log in to the GitLab Container Registry on the CI runner
  - echo "$CI_REGISTRY_PASSWORD" | docker login -u "$CI_REGISTRY_USER" --password-stdin "$CI_REGISTRY"

# 🧱 BUILD STAGE
build_image:
  stage: build
  tags:
    - ziya-web
  script:
    - docker build --no-cache -t "$DOCKER_IMAGE:$CI_COMMIT_REF_NAME" .
    - docker push "$DOCKER_IMAGE:$CI_COMMIT_REF_NAME"
  only:
    - beta
    - staging
    - live

# 🚀 DEPLOY TEMPLATE
.deploy_template: &deploy_template
  stage: deploy
  tags:
    - ziya-web
  before_script:
    # 2) Install your SSH key on the runner
    - mkdir -p ~/.ssh
    - echo "$SSH_KEY" | tr -d '\r' > ~/.ssh/id_rsa
    - chmod 600 ~/.ssh/id_rsa
    - ssh-keyscan -H "$TARGET_HOST" >> ~/.ssh/known_hosts
  script:
    - |
      ssh -o StrictHostKeyChecking=no ubuntu@"$TARGET_HOST" << EOF
      # 3) Log in to the GitLab registry on the remote host
      echo "$CI_REGISTRY_PASSWORD" | docker login -u "$CI_REGISTRY_USER" --password-stdin "$CI_REGISTRY"

      # 4) Stop, remove, pull, and run your container
      docker stop  $CONTAINER_NAME  || true
      docker rm    $CONTAINER_NAME  || true
      docker pull  $DOCKER_IMAGE:$CI_COMMIT_REF_NAME
      docker run --name $CONTAINER_NAME -d -p $PORT:3000 $DOCKER_IMAGE:$CI_COMMIT_REF_NAME
      EOF
  only:
    - beta
    - staging
    - live

# 🧩 DEPLOY JOBS
deploy_dev:
  <<: *deploy_template
  variables:
    SSH_KEY: $STAGING_KEY
    TARGET_HOST: 34.213.142.112
    CONTAINER_NAME: ziyaweb-dev
    PORT: 5000
  only:
    - beta

deploy_staging:
  <<: *deploy_template
  variables:
    SSH_KEY: $STAGING_KEY
    TARGET_HOST: 34.213.142.112
    CONTAINER_NAME: ziyaweb-staging
    PORT: 3000
  only:
    - staging

deploy_live:
  <<: *deploy_template
  variables:
    SSH_KEY: $LIVE_KEY
    TARGET_HOST: 34.213.142.112
    CONTAINER_NAME: ziyaweb-live
    PORT: 3001
  only:
    - live
