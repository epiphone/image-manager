from google.cloud import storage
from locust import HttpLocust, TaskSet, events, task
import time

BUCKET = storage.Client().get_bucket("imgmgr-images")


class UserBehavior(TaskSet):
    @task()
    def upload_image_to_bucket(self):
        blob = BUCKET.blob("image.jpg")
        t0 = time.time()
        try:
            blob.upload_from_filename("./image.jpg")
            time.sleep(2)  # eventual consistency workaround
            if not blob.exists():
                raise Exception("Blob upload failed")

            events.request_success.fire(
                request_type="google.cloud.storage",
                name="upload_from_filename",
                response_time=int((time.time() - t0) * 1000),
                response_length=0,
            )
        except Exception as e:
            print(e)
            events.request_failure.fire(
                request_type="google.cloud.storage",
                name="upload_from_filename",
                response_time=int((time.time() - t0) * 1000),
                exception=e,
            )


class WebsiteUser(HttpLocust):
    task_set = UserBehavior
    min_wait = 3000
    max_wait = 3000
