#include "messages.hpp"

#include <filesystem>
#include <fstream>
#include <base64.hpp>

namespace messages {

	input_file input_file::load_from(const std::string& path) {
		
		if (!std::filesystem::exists(path)) {
			return {};
		}

		auto file_size = std::filesystem::file_size(path);
		std::ifstream file(path, std::ios::binary);

		if (!file.good()) {
			return {};
		}

		std::string content;
		content.resize(file_size);
		file.read(reinterpret_cast<char*>(content.data()), file_size);

		return {
			.ok = true,
			.data = to_data_url(content, "application/octet-stream"),
		};
	}

	proxy_response proxy_response::from_data(std::string_view data, std::string_view mime, int status) {
		
		return { .status = status, .data = to_data_url(data, mime) };
	}

	proxy_response proxy_response::from_error(std::string_view error, int status) {
		
		return { .status = status, .error = std::string{error} };
	}

	std::string to_data_url(std::string_view data, std::string_view mime) {
		
		std::string data_prefix = "data:";
		std::string base64_prefix = ";base64,";
		std::string base64_data = base64::to_base64(data);

		std::string data_url;
		data_url.reserve(data_prefix.length() + mime.length() + base64_prefix.length() + base64_data.length());
		data_url.append(data_prefix);
		data_url.append(mime);
		data_url.append(base64_prefix);
		data_url.append(base64_data);

		return data_url;
	}
}
