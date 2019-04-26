from google.cloud import storage
from locust import HttpLocust, TaskSet, events, task
import time

BUCKET = storage.Client().get_bucket("imgmgr-images")


# class GCPStorageClient(storage.Client):
#     def __getattr__(self, name):
#         func = storage.Client.__getattr__(self, name)

#         def wrapper(*args, **kwargs):
#             start_time = time.time()
#             try:
#                 result = func(*args, **kwargs)
#             except Exception as e:
#                 total_time = int((time.time() - start_time) * 1000)
#                 events.request_failure.fire(
#                     request_type="google.cloud.storage",
#                     name=name,
#                     response_time=total_time,
#                     exception=e,
#                 )
#             else:
#                 total_time = int((time.time() - start_time) * 1000)
#                 events.request_success.fire(
#                     request_type="google.cloud.storage",
#                     name=name,
#                     response_time=total_time,
#                     response_length=0,
#                 )

#         return wrapper


# class XmlRpcLocust(Locust):
#     """
#     This is the abstract Locust class which should be subclassed. It provides an XML-RPC client
#     that can be used to make XML-RPC requests that will be tracked in Locust's statistics.
#     """

#     def __init__(self, *args, **kwargs):
#         super(XmlRpcLocust, self).__init__(*args, **kwargs)
#         self.client = GCPStorageClient(self.host)


class UserBehavior(TaskSet):
    @task()
    def upload_image_to_bucket(self):
        blob = BUCKET.blob("image.jpg")
        t0 = time.time()
        try:
            blob.upload_from_filename("./image.jpg")
            print("exists", blob.exists())
            if not blob.exists():
                raise Exception("Blob upload failed")

            events.request_success.fire(
                request_type="google.cloud.storage",
                name="upload_from_filename",
                response_time=int((time.time() - t0) * 1000),
                response_length=0,
            )
        except Exception as e:
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
