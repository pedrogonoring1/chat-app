#!/bin/bash

# Função para obter a última tag
get_last_tag() {
  git fetch --tags
  git describe --tags --abbrev=0
}

# Função para incrementar a versão da tag
increment_version() {
  version=$1
  type=$2

  IFS='.' read -r -a parts <<< "$version"

  if [ "$type" == "release" ]; then
    # Incrementar a versão principal (X.Y.Z -> X.Y+1.0)
    if [ "${parts[1]}" -eq 9 ]; then
      parts[0]=$((parts[0] + 1))
      parts[1]=0
    else
      parts[1]=$((parts[1] + 1))
    fi
    parts[2]=0
  elif [ "$type" == "hotfix" ]; then
    # Incrementar a versão de patch (X.Y.Z -> X.Y.Z+1)
    parts[2]=$((parts[2] + 1))
  fi

  echo "${parts[0]}.${parts[1]}.${parts[2]}"
}

# Função para abrir uma release
open_release() {
  last_tag=$(get_last_tag)
  next_version=$(increment_version $last_tag "release")

  # Atualizar a branch de desenvolvimento
  git checkout develop
  git pull origin develop

  # Criar nova release
  git flow release start $next_version
}

# Função para fechar uma release
close_release() {
  # Finalizar a release
  git flow release finish $1

  # Atualizar as branches de desenvolvimento e master
  git checkout develop
  git pull origin develop

  git checkout master
  git pull origin master
}

# Função para abrir um hotfix
open_hotfix() {
  last_tag=$(get_last_tag)
  next_version=$(increment_version $last_tag "hotfix")

  # Atualizar a branch de master
  git checkout master
  git pull origin master

  # Criar novo hotfix
  git flow hotfix start $next_version
}

# Função para fechar um hotfix
close_hotfix() {
  # Finalizar o hotfix
  git flow hotfix finish $1

  # Atualizar as branches de master e desenvolvimento
  git checkout develop
  git pull origin develop

  git checkout master
  git pull origin master
}

# Menu de opções
echo "Selecione uma opção:"
echo "1. Abrir release"
echo "2. Fechar release"
echo "3. Abrir hotfix"
echo "4. Fechar hotfix"

read option

case $option in
  1)
    open_release
    ;;
  2)
    echo "Informe a versão da release a ser fechada (ex: 0.2.0):"
    read version
    close_release $version
    ;;
  3)
    open_hotfix
    ;;
  4)
    echo "Informe a versão do hotfix a ser fechado (ex: 0.1.1):"
    read version
    close_hotfix $version
    ;;
  *)
    echo "Opção inválida!"
    ;;
esac
