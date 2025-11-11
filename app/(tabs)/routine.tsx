import { addDays, format, isAfter, isBefore, parseISO } from "date-fns";
import { ThemedView } from "@/components/themed-view";
import { LinearGradient } from "expo-linear-gradient";
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  Text,
  Alert,
} from "react-native";
import { CircleSmall } from "lucide-react-native";
import { ThemedText } from "@/components/themed-text";
import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getRoutineData,
  performRoutine,
  UpdateRoutineResponse,
} from "@/data/api/routine";
import type {
  Routine,
  RoutineData,
  RoutineOccurence,
} from "@/data/types/routine";
import { useUserTheme } from "@/providers/user-theme-provider";
import SlideInItem from "@/components/ui/slide-in-item";
import ConfirmationModal from "@/components/routine/confirmationModal";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useCacheRepository } from "@/data/database/cacheRepository";

const CurrentDateContext = createContext<Date>(new Date());

export default function RoutineMaintenance() {
  const { set: setCache } = useCacheRepository();
  const [loading, setLoading] = useState(true);
  const [routineData, setRoutineData] = useState<RoutineData>({});
  const [focusedRoutine, setFocusedRoutine] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [performing, setPerforming] = useState<boolean>(false);

  const { theme } = useUserTheme() ?? "light";
  const backgroundColor = useThemeColor({}, "background");
  const routinesCount = Object.keys(routineData).length;

  async function updateRoutineData(options: {
    data?: RoutineData;
    sha?: string;
  }) {
    setLoading(true);
    let data: RoutineData;
    if (options.data) {
      data = options.data;
    } else {
      data = await getRoutineData();
    }
    setCache("routine", JSON.stringify(data));
    setRoutineData(data);
    setLoading(false);
  }

  useEffect(() => {
    updateRoutineData({});
  }, []);

  const handlePerformRoutine = async (actor: string) => {
    if (!focusedRoutine) {
      setModalVisible(false);
      return;
    }

    setPerforming(true);

    const result: UpdateRoutineResponse = await performRoutine(
      focusedRoutine,
      actor,
    );
    if (!result.ok) {
      Alert.alert(
        "Failed to perform.",
        `The routine ${focusedRoutine} was not updated due to an unexpected error. Please try again later`,
        [
          {
            text: "Okay",
            style: "cancel",
          },
        ],
      );
    }

    setModalVisible(false);
    setPerforming(false);
    await updateRoutineData({ data: result.data });
  };

  if (loading) {
    return (
      <ThemedView style={styles.parentContainer}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Routine Maintenance</ThemedText>
        </ThemedView>
        <ThemedView style={styles.routineListContainer}>
          <ThemedText style={{ textAlign: "center" }} type="defaultSemiBold">
            Loading...
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor }}>
      <ThemedView style={styles.parentContainer}>
        <ConfirmationModal
          visible={modalVisible}
          onSuccess={handlePerformRoutine}
          onCancel={() => setModalVisible(false)}
          disabled={performing}
        ></ConfirmationModal>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Routine Maintenance</ThemedText>
        </ThemedView>
        <CurrentDateContext.Provider value={new Date()}>
          <View style={styles.routineListContainer}>
            {Object.entries(routineData).map(([slug, routine], idx) => {
              return (
                <Fragment key={slug}>
                  <Pressable
                    onPress={() => {
                      if (focusedRoutine === slug) setFocusedRoutine(null);
                      else setFocusedRoutine(slug);
                    }}
                  >
                    <SlideInItem delay={idx * 50}>
                      <RoutineItem
                        routine={routine}
                        focused={slug === focusedRoutine}
                        theme={theme}
                        openModal={() => setModalVisible(true)}
                      ></RoutineItem>
                    </SlideInItem>
                  </Pressable>
                  {idx < routinesCount - 1 && <View></View>}
                </Fragment>
              );
            })}
          </View>
        </CurrentDateContext.Provider>
      </ThemedView>
    </ScrollView>
  );
}

function RoutineItem({
  routine,
  focused,
  theme,
  openModal,
}: {
  routine: Routine;
  focused: boolean;
  theme: "light" | "dark";
  openModal: () => void;
}) {
  const lastOccurence: RoutineOccurence | undefined = routine.times.at(-1);
  const lastDate: Date | undefined = lastOccurence
    ? parseISO(lastOccurence.date)
    : undefined;
  const expectedDate: Date | undefined = lastDate
    ? addDays(lastDate, routine.interval)
    : undefined;
  const currentDate = useContext(CurrentDateContext);
  const isDue: boolean = expectedDate
    ? isAfter(currentDate, expectedDate)
    : false;
  const recentOccurences: RoutineOccurence[] = routine.times.slice(-4, -1);

  const borderColor = useMemo(() => {
    if (focused) {
      return theme === "dark" ? "white" : "#32CD32";
    }
    return "cyan";
  }, [theme]);

  return (
    <View style={[styles.container, { borderColor }]}>
      <LinearGradient
        colors={
          theme === "dark"
            ? ["rgba(120, 81, 169, 0.4)", "rgba(120, 81, 169, 0.6)"]
            : ["rgba(0, 127, 255, 0.4)", "rgba(0, 127, 255, 0.6)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <ThemedText
        darkColor={"white"}
        lightColor={"white"}
        type="subtitle"
        style={{ letterSpacing: 1, fontSize: 24 }}
      >
        {routine.name}
      </ThemedText>
      <View style={[{ gap: 4, alignItems: "center" }]}>
        {lastDate ? (
          <ThemedText
            type="defaultSemiBold"
            style={{ letterSpacing: 1 }}
            lightColor={"white"}
            darkColor={"white"}
          >
            Previous: {format(lastDate, "MMMM d: h:mm a")}
          </ThemedText>
        ) : (
          <ThemedText
            type="defaultSemiBold"
            style={{ letterSpacing: 1, textAlign: "center" }}
            lightColor={"red"}
            darkColor={"red"}
          >
            Has not been performed before.{"\n"}
          </ThemedText>
        )}
        {expectedDate && (
          <ThemedText
            type="defaultSemiBold"
            style={{
              letterSpacing: 1,
              color: isDue ? "red" : "#39ff14",
            }}
          >
            Due: {format(expectedDate, "MMMM d: h:mm a")}
          </ThemedText>
        )}
      </View>
      {focused && (
        <View style={{ gap: 12 }}>
          <ThemedText lightColor="white" style={{ textAlign: "center" }}>
            {routine.description}
          </ThemedText>

          <View
            style={[
              styles.occurencesContainer,
              {
                backgroundColor:
                  theme === "light"
                    ? "rgba(105, 105, 105, 0.2)"
                    : "rgba(105, 105, 105, 0.2)",
              },
            ]}
          >
            {recentOccurences.length > 0 ? (
              recentOccurences.map((t, idx) => (
                <Fragment key={t.date}>
                  <View style={styles.occurence}>
                    <CircleSmall
                      fill={theme === "light" ? "black" : "white"}
                      color={theme === "light" ? "black" : "white"}
                      style={{
                        opacity: 0.8,
                      }}
                    />
                    <View
                      style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}
                    >
                      <ThemedText>
                        {format(parseISO(t.date), "MMMM d, h:mm a")}
                      </ThemedText>
                      <ThemedText>-</ThemedText>
                      <ThemedText>{t.actor}</ThemedText>
                    </View>
                  </View>
                </Fragment>
              ))
            ) : (
              <ThemedText>There are no previous occurences</ThemedText>
            )}
          </View>
          <Pressable
            onPress={() => openModal()}
            style={[
              styles.performedButton,
              { backgroundColor: theme === "light" ? "#2f8B58" : "green" },
            ]}
          >
            <ThemedText
              lightColor="white"
              style={{ textAlign: "center" }}
              type="defaultSemiBold"
            >
              Routine Performed
            </ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  parentContainer: {
    paddingHorizontal: 32,
    paddingVertical: 48,
    flex: 1,
  },
  routineListContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    width: "100%",
    paddingVertical: 48,
  },
  container: {
    display: "flex",
    width: 350,
    flexDirection: "column",
    gap: 14,
    padding: 32,
    borderWidth: 0,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "flex-start",
    elevation: 2,
    shadowColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  occurencesContainer: {
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 6,
    opacity: 0.8,
  },
  occurence: {
    width: "90%",
    paddingVertical: 4,
    paddingHorizontal: 6,
    flexDirection: "row",
    gap: 4,
    alignItems: "flex-start",
  },
  performedButton: {
    paddingVertical: 12,
  },
  seperator: {
    width: "80%",
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "white",
  },
});
