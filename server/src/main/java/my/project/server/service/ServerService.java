package my.project.server.service;

import my.project.server.model.Server;

import java.io.IOException;
import java.net.UnknownHostException;
import java.util.Collection;
import java.util.Optional;

public interface ServerService {
    Server createServer(Server server);
    Server pingServer(String ipAddress) throws UnknownHostException, IOException;
    Collection<Server> getAllServers(int limit);
    Optional<Server> getServerById(Long id);
    Optional<Server> updateServer(Server server);
    Boolean deleteServer(Long id);
}
