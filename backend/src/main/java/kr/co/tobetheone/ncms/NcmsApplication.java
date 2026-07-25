package kr.co.tobetheone.ncms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;

@SpringBootApplication(exclude = {FlywayAutoConfiguration.class})
public class NcmsApplication {

	public static void main(String[] args) {
		SpringApplication.run(NcmsApplication.class, args);
	}

}
