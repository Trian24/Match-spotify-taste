const authHandler = (resp) => {
  if (resp.status === 200) {
    return resp.json();
  } else {
    return Promise.reject(resp);
  }
};

const errorHandler = (err, res) => {
  console.log(err)
  res.status(err.status).send(err);
}

export {authHandler, errorHandler};