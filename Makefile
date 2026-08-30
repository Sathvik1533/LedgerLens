.PHONY: test-ci test up down

test-ci:
	docker compose -f docker-compose.test.yml up -d --wait
	PYTHONPATH=. pytest -v tests/integration/ tests/e2e/ tests/evaluation/
	docker compose -f docker-compose.test.yml down -v

test:
	PYTHONPATH=. pytest -v tests/integration/ tests/e2e/ tests/evaluation/

up:
	docker compose -f docker-compose.test.yml up -d --wait

down:
	docker compose -f docker-compose.test.yml down -v
