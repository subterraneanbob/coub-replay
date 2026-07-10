#pragma once

#include <string>

namespace messages {

	struct input_file
	{
		bool ok{ false };
		std::string data{};

		static input_file load_from(const std::string& path);
	};

	struct proxy_response {
		int status{ 200 };
		std::string data{};
		std::string error{};

		static proxy_response from_data(std::string_view data, std::string_view mime, int status = 200);
		static proxy_response from_error(std::string_view error, int status = 502);
	};

	std::string to_data_url(std::string_view data, std::string_view mime);
}
