docker-compose -f docker-compose.override.yml up --build --abort-on-container-exit - Test
docker-compose -f docker-compose.dev.yaml up --build - Start
docker-compose -f docker-compose.dev.yaml down -v    - Down