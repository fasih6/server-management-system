package my.project.server;

import my.project.server.enums.Status;
import my.project.server.model.Server;
import my.project.server.repo.ServerRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class ServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServerApplication.class, args);
	}

    @Bean
    CommandLineRunner run(ServerRepo serverRepo) {
        return args -> {
            long count = serverRepo.count(); // check how many records exist
            if (count < 4) { // if less than 4, add missing servers
                if (serverRepo.findServerByIpAddress("192.168.1.160").isEmpty()) {
                    serverRepo.save(new Server(null, "192.168.1.160", "Ubuntu Linux", "16 GB", "Personal PC", "http://localhost:8080/images/server.png", Status.SERVER_UP));
                }
                if (serverRepo.findServerByIpAddress("192.168.1.58").isEmpty()) {
                    serverRepo.save(new Server(null, "192.168.1.58", "Fedora Linux", "16 GB", "Dell Tower", "http://localhost:8080/images/server.png", Status.SERVER_DOWN));
                }
                if (serverRepo.findServerByIpAddress("192.168.1.21").isEmpty()) {
                    serverRepo.save(new Server(null, "192.168.1.21", "MS 2008", "32 GB", "Web Server", "http://localhost:8080/images/server.png", Status.SERVER_UP));
                }
                if (serverRepo.findServerByIpAddress("192.168.1.14").isEmpty()) {
                    serverRepo.save(new Server(null, "192.168.1.14", "Red Hat Enterprise Linux", "64 GB", "Mail Server", "http://localhost:8080/images/server.png", Status.SERVER_DOWN));
                }
            }
        };
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // allow all endpoints
                        .allowedOrigins("http://localhost:4200") // Angular dev server
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }

}
