# Load tests

[Locust](https://docs.locust.io/en/stable/)-based load tests for both VM and serverless deployments of `image-manager`.

## Run

```bash
sudo apt install python3-pip
python3 -m pip install --user pipenv
pipenv install
pipenv shell
locust -H http://<imgmgr API address>

# ...or load testing against the serverless deployment (-H parameter takes any URL):
locust -H http://google.com -f serverless.py
```
