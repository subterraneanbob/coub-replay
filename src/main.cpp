#include <saucer/smartview.hpp>
#include <saucer/embedded/all.hpp>
#include <cpr/cpr.h>
#include <platform_folders.h>
#include <filesystem>
#include "messages.hpp"

#ifdef _WIN32
#include <windows.h>
#include <shellapi.h>
#endif

inline constexpr std::string_view g_app_name = "coub-replay";
static std::filesystem::path g_input_file_path;

static std::optional<saucer::icon> load_icon()
{
	const auto& embedded_files = saucer::embedded::all();

	if (auto it = embedded_files.find("/coub.ico"); it != embedded_files.end()) {
		const auto& file = it->second;

		if (auto icon = saucer::icon::from(file.content)) {
			return icon.value();
		}
	}

	return std::nullopt;
}

static coco::stray start(saucer::application* app)
{
	std::filesystem::path storage_path = std::filesystem::path(sago::getCacheDir()) / g_app_name;

	auto window = saucer::window::create(app).value();
	auto webview = saucer::smartview::create({ .window = window, .storage_path = storage_path });

	window->set_title("Coub Replay");
	window->set_min_size(saucer::size{ .w = 600, .h = 700 });
	window->set_size(saucer::size{ .w = 900, .h = 800 });

	if (auto icon = load_icon()) {
		window->set_icon(icon.value());
	}

	webview->embed(saucer::embedded::all());

#ifndef NDEBUG
	webview->set_dev_tools(true);
#endif

	webview->expose("load_input_file", []() -> messages::input_file
		{
			return messages::input_file::load_from(g_input_file_path);
		});

	webview->expose("cors_proxy_get", [](std::string url) -> std::expected<messages::proxy_response, std::string>
		{
			auto parsed_url = saucer::url::parse(url);

			if (!parsed_url.has_value()) {
				return std::unexpected("Invalid URL.");
			}

			cpr::Response r = cpr::Get(cpr::Url(url), cpr::Timeout(30000));

			if (r.error) {
				return messages::proxy_response::from_error(r.error.message);
			}

			std::string mime = "application/octet-stream";
			if (auto it = r.header.find("content-type"); it != r.header.end())
				mime = it->second;

			return messages::proxy_response::from_data(r.text, mime, r.status_code);
		});

	webview->serve("/index.html");
	window->show();

	co_await app->finish();
}

int main(int argc, char* argv[])
{

#ifdef _WIN32

	int nArgs;
	LPWSTR* szArglist = CommandLineToArgvW(GetCommandLineW(), &nArgs);

	if (nArgs > 1) {
		g_input_file_path = std::filesystem::path(szArglist[1]);
	}

	LocalFree(szArglist);

#else

	if (argc > 1) {
		g_input_file_path = std::filesystem::path(argv[1]);
	}

#endif

	return saucer::application::create({ .id = g_app_name })->run(start);
}
