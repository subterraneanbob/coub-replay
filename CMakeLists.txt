cmake_minimum_required (VERSION 3.21)

project(CoubReplay LANGUAGES CXX VERSION 1.0.0)

# Install third-party libraries
include("cmake/CPM.cmake")

CPMAddPackage(
    NAME           saucer
    VERSION        8.0.5
    GIT_REPOSITORY https://github.com/saucer/saucer
)

CPMAddPackage(
    NAME           cpr
    GIT_TAG        1.14.2
    GIT_REPOSITORY https://github.com/libcpr/cpr
    OPTIONS        
        "BUILD_SHARED_LIBS OFF"
        "BUILD_EXAMPLES OFF"
        "BUILD_CURL_EXE OFF"
        "CURL_DISABLE_INSTALL OFF"
        "BUILD_LIBCURL_DOCS OFF"
        "BUILD_MISC_DOCS OFF"
        "ENABLE_CURL_MANUAL OFF"
        "CPR_CURL_NOSIGNAL ON"
        "CPR_CURL_USE_LIBPSL OFF"
)

CPMAddPackage(
    NAME           base64
    GIT_TAG        8d96a2a
    GIT_REPOSITORY https://github.com/tobiaslocker/base64
    OPTIONS        "BASE64_ENABLE_TESTING OFF"
)

CPMAddPackage(
    NAME           platform_folders
    GIT_TAG        4.3.0
    GIT_REPOSITORY https://github.com/sago007/PlatformFolders
    OPTIONS        "PLATFORMFOLDERS_BUILD_SHARED_LIBS OFF"
)

CPMAddPackage(
    NAME           CPMLicenses.cmake 
    VERSION        0.0.7
    GIT_REPOSITORY https://github.com/cpm-cmake/CPMLicenses.cmake
)

# Check if frontend web assets exist
if (NOT EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/frontend/dist/index.html")
    message(FATAL_ERROR "Web assets need to be built first. Please run \"npm ci && npm run build\" from the \"frontend\" folder.")
endif()

# Bundle third-party licenses
set(VITE_LICENSES_SRC "${CMAKE_CURRENT_SOURCE_DIR}/frontend/dist/.vite/license.md")
set(CPM_DISCLAIMER_OUT "${CMAKE_CURRENT_BINARY_DIR}/licenses.tmp")
set(LICENSES_OUT "${CMAKE_CURRENT_BINARY_DIR}/THIRD_PARTY_LICENSES.md")

cpm_licenses_create_disclaimer_target(
    generate_cpm_licenses "${CPM_DISCLAIMER_OUT}" "${CPM_PACKAGES}"
)

add_custom_target(licenses
    ALL
    COMMAND ${CMAKE_COMMAND} -E cat "${VITE_LICENSES_SRC}" > "${LICENSES_OUT}"
    COMMAND ${CMAKE_COMMAND} -E echo "" >> "${LICENSES_OUT}"
    COMMAND ${CMAKE_COMMAND} -E echo "## Additional licenses" >> "${LICENSES_OUT}"
    COMMAND ${CMAKE_COMMAND} -E echo "" >> "${LICENSES_OUT}"
    COMMAND ${CMAKE_COMMAND} -E cat "${CPM_DISCLAIMER_OUT}" >> "${LICENSES_OUT}"
    COMMENT "Merging Vite license.md and CPM licenses into a single file"
    DEPENDS generate_cpm_licenses
)

# Build executable
add_executable(${PROJECT_NAME} "src/main.cpp" "src/messages.cpp")
set_target_properties(
    ${PROJECT_NAME} PROPERTIES 
    CXX_STANDARD 23 
    CXX_EXTENSIONS OFF 
    CXX_STANDARD_REQUIRED ON
    WIN32_EXECUTABLE $<BOOL:${WIN32}>
)

target_compile_features(${PROJECT_NAME} PRIVATE cxx_std_23)

if(MSVC)
    target_link_options(${PROJECT_NAME} PRIVATE "/SUBSYSTEM:WINDOWS" "/ENTRY:mainCRTStartup")
endif()

saucer_embed("frontend/dist" TARGET ${PROJECT_NAME})
target_link_libraries(${PROJECT_NAME} PRIVATE saucer::saucer saucer::embedded cpr::cpr base64 platform_folders)
