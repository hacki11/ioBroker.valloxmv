FROM iobroker/iobroker:latest-v10
RUN ln -s /opt/iobroker/node_modules/ /root/.node_modules

# add ssh client to be able to work with git
RUN apt-get update && apt-get -y install openssh-client