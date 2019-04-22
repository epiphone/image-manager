# Load tests

[Locust](https://docs.locust.io/en/stable/)-based load tests for both VM and serverless deployments of `image-manager`.

## Setup

```bash
sudo apt install python3-pip
python3 -m pip install --user pipenv
pipenv install
pipenv shell
```

## Run

```bash
locust vm.py # or serverless.py
```
