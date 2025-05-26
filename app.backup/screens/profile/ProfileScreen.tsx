import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { format } from "date-fns";
import Constants from "expo-constants";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/api";
import CountryPicker, { Country, getAllCountries } from "react-native-country-picker-modal";

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const { user, signOut } = useAuth();

  // Helper function to find country by name
  const findCountryByName = async (countryName: string): Promise<Country | null> => {
    try {
      const countries = await getAllCountries();
      const foundCountry = countries.find(
        (country) =>
          country.name?.toLowerCase() === countryName.toLowerCase() ||
          country.name?.common?.toLowerCase() === countryName.toLowerCase()
      );
      return foundCountry || null;
    } catch (error) {
      console.error("Error finding country:", error);
      return null;
    }
  };

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateInputText, setDateInputText] = useState("");
  const [country, setCountry] = useState<Country | null>(null);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load user data
  useEffect(() => {
    if (user) {
      setLoading(true);

      const fetchUserProfile = async () => {
        try {
          // Get user profile from API
          const userProfile = await userService.getUserProfile(user.id);

          if (userProfile) {
            // Set first and last name from API data
            if (userProfile.first_name && userProfile.last_name) {
              setFirstName(userProfile.first_name);
              setLastName(userProfile.last_name);
            } else if (userProfile.firstName && userProfile.lastName) {
              // Fallback to camelCase fields if they exist
              setFirstName(userProfile.firstName);
              setLastName(userProfile.lastName);
            } else if (user.displayName) {
              // Fallback to display name from Auth
              const nameParts = user.displayName.split(" ");
              setFirstName(nameParts[0] ?? "");
              setLastName(nameParts.slice(1).join(" ") ?? "");
            }

            // Set date of birth if available
            if (userProfile.date_of_birth) {
              try {
                const dobDate = new Date(userProfile.date_of_birth);
                if (!isNaN(dobDate.getTime())) {
                  setDob(dobDate);
                  setDateInputText(format(dobDate, "MM/dd/yyyy"));
                  console.log("Loaded date_of_birth:", dobDate);
                } else {
                  console.warn("Invalid date_of_birth format:", userProfile.date_of_birth);
                }
              } catch (error) {
                console.error("Error parsing date_of_birth:", error);
              }
            } else if (userProfile.dob) {
              try {
                const dobDate = new Date(userProfile.dob);
                if (!isNaN(dobDate.getTime())) {
                  setDob(dobDate);
                  setDateInputText(format(dobDate, "MM/dd/yyyy"));
                  console.log("Loaded dob:", dobDate);
                } else {
                  console.warn("Invalid dob format:", userProfile.dob);
                }
              } catch (error) {
                console.error("Error parsing dob:", error);
              }
            }

            // Set country if available
            if (userProfile.country) {
              console.log("Loading country from server:", userProfile.country);
              // Try to find the country in the country picker's data
              findCountryByName(userProfile.country).then((foundCountry) => {
                if (foundCountry) {
                  setCountry(foundCountry);
                  console.log("Found and set country:", foundCountry);
                } else {
                  console.warn("Could not find country:", userProfile.country);
                  // Create a fallback country object with just the name
                  const fallbackCountry: Country = {
                    name: userProfile.country,
                    cca2: "XX", // Unknown country code
                    flag: "",
                    callingCode: [""],
                  };
                  setCountry(fallbackCountry);
                }
              }).catch((error) => {
                console.error("Error loading country:", error);
              });
            }

            // Set avatar URL if available
            if (userProfile.photo_url) {
              setAvatarUrl(userProfile.photo_url);
            } else if (userProfile.photoURL) {
              setAvatarUrl(userProfile.photoURL);
            }
          } else {
            // No profile found, use Auth data as fallback
            if (user.displayName) {
              const nameParts = user.displayName.split(" ");
              setFirstName(nameParts[0] ?? "");
              setLastName(nameParts.slice(1).join(" ") ?? "");
            }
          }

          // Set email from Auth (always available)
          setEmail(user.email ?? "");

          // Set avatar URL from Auth if not already set
          if (!avatarUrl && user.photoURL) {
            setAvatarUrl(user.photoURL);
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
          Alert.alert(
            "Error",
            "Failed to load profile data. Please try again."
          );
        } finally {
          setLoading(false);
        }
      };

      fetchUserProfile();
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    // Check if user is at least 13 years old
    if (dob) {
      const today = new Date();
      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      console.log("Age validation:", {
        dob: dob,
        birthDate: birthDate,
        today: today,
        calculatedAge: age
      });

      if (age < 13) {
        newErrors.dob = "You must be at least 13 years old";
      }

      if (age > 120) {
        newErrors.dob = "Please enter a valid date of birth";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    console.log("Save button clicked!");
    if (!user) {
      console.log("No user found, returning");
      return;
    }

    console.log("User found:", user.id);

    // Validate form
    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    console.log("Form validation passed");
    setSaving(true);
    try {
      // Combine first and last name
      const displayName = `${firstName} ${lastName}`.trim();

      // Create a complete user profile object with backend field names
      const profileData = {
        display_name: displayName,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dob ? dob.toISOString().split('T')[0] : null, // Send only date part (YYYY-MM-DD)
        country: country
          ? (typeof country.name === "string"
              ? country.name
              : country.name?.common || country.name?.official || null)
          : null,
        // Keep the existing photoURL
        photo_url: avatarUrl ?? undefined,
      };

      console.log("Date of birth being sent:", {
        original: dob,
        formatted: dob ? dob.toISOString().split('T')[0] : null
      });

      console.log("Sending profile data:", profileData);

      // Update user profile using the API
      const result = await userService.updateUserProfile(user.id, profileData);

      console.log("Profile updated successfully:", result);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePickAvatar = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant permission to access your photos"
      );
      return;
    }

    // Launch image picker with built-in editing capabilities
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // This enables the built-in cropping UI
      aspect: [1, 1], // Force a square aspect ratio
      quality: 0.7, // Reduce quality to optimize file size
      exif: false, // Don't include EXIF data (reduces file size)
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      uploadAvatar(selectedImage.uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!user) return;

    setUploading(true);
    try {
      const result = await userService.uploadUserAvatar(user.id, uri);
      setAvatarUrl(result.photoURL || result.photo_url);
      Alert.alert("Success", "Profile picture updated successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      Alert.alert(
        "Error",
        "Failed to upload profile picture. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    console.log("Date picker event:", event.type, selectedDate);

    // On Android, always close the picker after selection
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    // On iOS, keep picker open unless dismissed
    if (Platform.OS === "ios" && event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    if (selectedDate) {
      console.log("Setting new date:", selectedDate);
      setDob(selectedDate);
      if (errors.dob) {
        setErrors({ ...errors, dob: "" });
      }
    }
  };

  const handleChangeEmail = () => {
    navigation.navigate("ChangeEmail");
  };

  const handleChangePassword = () => {
    navigation.navigate("ChangePassword");
  };

  const handleDeleteAccount = () => {
    navigation.navigate("DeleteAccount");
  };

  const handleLogout = async () => {
    console.log("Logout button pressed - bypassing confirmation");
    try {
      console.log("Attempting to sign out directly");
      await signOut();
      console.log("Logout completed");
    } catch (error) {
      console.error("Error during logout:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarContainer}>
            {uploading ? (
              <View style={styles.avatar}>
                <ActivityIndicator size="large" color="#4CAF50" />
              </View>
            ) : avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.defaultAvatar]}>
                <Ionicons name="person" size={60} color="#ccc" />
              </View>
            )}
            <TouchableOpacity
              style={styles.changeAvatarButton}
              onPress={handlePickAvatar}
              disabled={uploading}
            >
              <Text style={styles.changeAvatarText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.firstName ? styles.inputError : null,
                ]}
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  if (errors.firstName) {
                    setErrors({ ...errors, firstName: "" });
                  }
                }}
                placeholder="Enter your first name"
                placeholderTextColor="#999"
              />
              {errors.firstName ? (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.lastName ? styles.inputError : null,
                ]}
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  if (errors.lastName) {
                    setErrors({ ...errors, lastName: "" });
                  }
                }}
                placeholder="Enter your last name"
                placeholderTextColor="#999"
              />
              {errors.lastName ? (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date of Birth</Text>
              {Platform.OS === "web" ? (
                // Web-specific date input with better UX
                <View style={styles.webDateContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      errors.dob ? styles.inputError : null,
                      styles.webDateTextInput
                    ]}
                    value={dateInputText}
                    onChangeText={(text) => {
                      console.log("Web date text input changed:", text);
                      setDateInputText(text);

                      // Allow user to type freely
                      if (!text.trim()) {
                        setDob(null);
                        if (errors.dob) {
                          setErrors({ ...errors, dob: "" });
                        }
                        return;
                      }

                      // Try to parse various date formats
                      const parseDate = (dateStr: string): Date | null => {
                        // Remove any extra spaces
                        const cleanStr = dateStr.trim();

                        // Try MM/DD/YYYY format
                        const mmddyyyy = cleanStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                        if (mmddyyyy) {
                          const [, month, day, year] = mmddyyyy;
                          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                          return isNaN(date.getTime()) ? null : date;
                        }

                        // Try M/D/YYYY format (single digits)
                        const mdyyyy = cleanStr.match(/^(\d{1})\/(\d{1})\/(\d{4})$/);
                        if (mdyyyy) {
                          const [, month, day, year] = mdyyyy;
                          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                          return isNaN(date.getTime()) ? null : date;
                        }

                        // Try YYYY-MM-DD format
                        const yyyymmdd = cleanStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
                        if (yyyymmdd) {
                          const [, year, month, day] = yyyymmdd;
                          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                          return isNaN(date.getTime()) ? null : date;
                        }

                        // Try other common formats
                        const date = new Date(cleanStr);
                        return isNaN(date.getTime()) ? null : date;
                      };

                      const parsedDate = parseDate(text);
                      if (parsedDate) {
                        setDob(parsedDate);
                        if (errors.dob) {
                          setErrors({ ...errors, dob: "" });
                        }
                      }
                    }}
                    onBlur={() => {
                      // Format the input when user finishes typing
                      if (dob) {
                        setDateInputText(format(dob, "MM/dd/yyyy"));
                      }
                    }}
                    placeholder="MM/DD/YYYY or click calendar"
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    style={styles.webDatePickerButton}
                    onPress={() => {
                      // Create a hidden date input for the native picker
                      const input = document.createElement('input');
                      input.type = 'date';
                      input.value = dob ? dob.toISOString().split('T')[0] : '';
                      input.max = new Date().toISOString().split('T')[0];
                      input.min = '1900-01-01';

                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.value) {
                          const newDate = new Date(target.value + 'T00:00:00');
                          if (!isNaN(newDate.getTime())) {
                            setDob(newDate);
                            setDateInputText(format(newDate, "MM/dd/yyyy"));
                            if (errors.dob) {
                              setErrors({ ...errors, dob: "" });
                            }
                          }
                        }
                      };

                      input.click();
                    }}
                  >
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              ) : (
                // Mobile date picker
                <TouchableOpacity
                  style={[styles.input, errors.dob ? styles.inputError : null]}
                  onPress={() => {
                    console.log("Date picker button pressed");
                    setShowDatePicker(true);
                  }}
                >
                  <Text style={dob ? styles.inputText : styles.placeholderText}>
                    {dob
                      ? format(dob, "MMMM d, yyyy")
                      : "Select your date of birth"}
                  </Text>
                </TouchableOpacity>
              )}
              {errors.dob ? (
                <Text style={styles.errorText}>{errors.dob}</Text>
              ) : null}
            </View>

            {showDatePicker && Platform.OS !== "web" && (
              <View>
                <DateTimePicker
                  value={dob || new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)} // January 1, 1900
                  textColor="#333"
                  themeVariant="light"
                />
                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    style={styles.datePickerDoneButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.datePickerDoneText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Country</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setCountryPickerVisible(true)}
              >
                <Text
                  style={country ? styles.inputText : styles.placeholderText}
                >
                  {country
                    ? (typeof country.name === "string"
                        ? country.name
                        : country.name?.common || country.name?.official || "Selected country")
                    : "Select your country"}
                </Text>
              </TouchableOpacity>
            </View>

            <CountryPicker
              visible={countryPickerVisible}
              onClose={() => setCountryPickerVisible(false)}
              onSelect={(country) => {
                setCountry(country);
                setCountryPickerVisible(false);
              }}
              withFlag
              withFilter
              withCountryNameButton
              countryCode={country?.cca2 ?? "US"}
            />
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                editable={false} // Email is not editable directly
              />
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleChangeEmail}
            >
              <Text style={styles.actionButtonText}>Change Email</Text>
              <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleChangePassword}
            >
              <Text style={styles.actionButtonText}>Change Password</Text>
              <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={handleSaveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          {/* Account Actions */}
          <View style={styles.accountActions}>
            {/* Delete Account Button */}
            <TouchableOpacity
              style={styles.deleteAccountButton}
              onPress={handleDeleteAccount}
            >
              <Ionicons name="trash-outline" size={20} color="#FF5252" />
              <Text style={styles.deleteAccountText}>Delete Account</Text>
            </TouchableOpacity>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#FF5252" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  defaultAvatar: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  changeAvatarButton: {
    marginTop: 10,
  },
  changeAvatarText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#f5f5f5",
  },
  inputError: {
    borderColor: "#FF5252",
  },
  errorText: {
    color: "#FF5252",
    fontSize: 12,
    marginTop: 4,
  },
  inputText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
  actionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  actionButtonText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: "#a5d6a7",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  accountActions: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  deleteAccountButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ffcdd2",
    borderRadius: 8,
    backgroundColor: "#ffebee",
  },
  deleteAccountText: {
    color: "#FF5252",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  logoutButtonText: {
    color: "#FF5252",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  datePickerDoneButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 10,
    marginHorizontal: 20,
  },
  datePickerDoneText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  webDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  webDateTextInput: {
    flex: 1,
    paddingRight: 40, // Make room for the calendar icon
  },
  webDatePickerButton: {
    position: "absolute",
    right: 12,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  webDateInput: {
    // Web-specific styling for date input
    ...(Platform.OS === "web" && {
      // @ts-ignore - Web-specific styles
      cursor: "pointer",
      // @ts-ignore
      "::-webkit-calendar-picker-indicator": {
        cursor: "pointer",
      },
    }),
  },
});

export default ProfileScreen;
