#!/bin/bash
# Rishi Ghan
# Deployment script for a microservice

# usage: ./deploy.sh -d [configuration directory]
#                    -s [service name]
#                    -h [hostname]
#                    -u [username]

# Emojis
CLIPBOARD="📋"
CHECKMARK="✅"
RENAME="🏷️"
SCISSORS="✂️"
DOWNLOAD="📥"
BROOM="🧹"
CONSTRUCTION="🏗️"
START="🏁"

# ssh config
cat >> ~/.ssh/config  << EOF
VerifyHostKeyDNS yes
StrictHostKeyChecking no
EOF

# params
directory_name=''
service_name=''
hostname=''
username=''

while getopts 'd:s:h:u:r:' flag; do
    case "${flag}" in
        d) directory_name="${OPTARG}" ;;
        s) service_name="${OPTARG}" ;;
        h) hostname="${OPTARG}" ;;
        u) username="${OPTARG}" ;;
        r) repository_base_url="${OPTARG}" ;;
        *) printf "Usage..."
           exit 1 ;;
    esac
done

printf "$CLIPBOARD Attempting to create configuration folder...\n"

ssh "$username@$hostname" /bin/bash << EOF
if [ ! -d "$directory_name" ]
then
    printf "\n$CLIPBOARD Directory doesn't exist. Creating now...\n"
    mkdir "$directory_name"
    printf "$directory_name created."
else
    printf "\n$RENAME  $directory_name already exists. Removing and recreating...\n"
    rm -Rf "$directory_name"
    mkdir "$directory_name"
    printf "$CHECKMARK Done.\n"
fi
    printf "\n$CLIPBOARD Changing directory to $directory_name...\n"
    cd "$directory_name"

    printf "\n$SCISSORS  Pruning Docker images, networks and volumes...\n\n"
    docker system prune -f

    printf "$DOWNLOAD Downloading the docker-compose configuration for Analytics Service...\n\n"
    printf "$repository_base_url\n\n"
    curl "$repository_base_url"/Dockerfile --output Dockerfile
    curl "$repository_base_url"/docker-compose.yml --output docker-compose.yml
    curl "$repository_base_url"/docker-compose.env --output docker-compose.env
    
    printf "\n$BROOM Stopping and removing containers and volumes...\n\n"
    docker-compose down -v
    
    printf "\n$DOWNLOAD Pulling the relevant Docker images...\n\n"
    docker-compose pull

    printf "\n$CONSTRUCTION  Creating containers...\n\n"
    docker-compose up --no-start

    printf "\n$START Starting images...\n\n"
    docker-compose start
EOF
