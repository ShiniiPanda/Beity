import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TabPage } from "@/components/tab-page";
import { useEffect, useState } from "react";
import { MealData, MealSelection } from "@/data/types/menu";
import { Cache, useCacheRepository } from "@/data/database/cacheRepository";

const DEFAULT_MEAL_SELECTION: MealSelection = {
  carbs: "",
  greens: "",
  protein: "",
  lastModifiedAt: "",
  lastModifiedBy: "",
  order: 0,
  custom: "",
};

const getMealSelectionTemplate = () => ({ ...DEFAULT_MEAL_SELECTION });

export default function TabTwoScren() {
  const [currentMealSelection, setCurrentMealSelection] =
    useState<MealSelection>(getMealSelectionTemplate());
  const [mealData, setMealData] = useState<MealData | undefined>(undefined);
  const [localMealSelection, setLocalMealSelection] = useState<
    MealSelection | undefined
  >(undefined);
  const { get: getFromCache } = useCacheRepository();

  const currentDate = new Date();

  const fetchCachedMealData = async () => {
    const cachedData: Cache | null = await getFromCache("menu");
    if (cachedData === null) {
      setMealData({
        meals: {},
        lastModifiedAt: new Date().toString(),
        lastModifiedBy: "",
      });
      return;
    }
    const data = JSON.parse(cachedData.value) as MealData;
    setMealData(data);
  };

  const fetchOnlineMealData = async () => {};

  useEffect(() => {
    async () => {
      await fetchCachedMealData();
    };
  }, []);

  const selectionNotEmpty = (): boolean => {
    return false;
  };

  return (
    <TabPage title="Menu Selection">
      <ThemedView style={styles.contentContainer}>
        <ThemedView
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            gap: 32,
          }}
        >
          <ThemedText type="subtitle">Current Selection: </ThemedText>
          <ThemedView style={{}}>
            <Picker values={[]} onValuesChange={({ name, value }) => {}} />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TabPage>
  );
}

function Picker({
  values,
  onValuesChange,
  selected,
  placeholder = "Select an option...",
}: {
  values: Array<{ name: string; value: string }>;
  onValuesChange: ({ name, value }: { name: string; value: string }) => void;
  selected?: number;
  placeholder?: string;
}) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Pressable onPress={() => setOpen((prev) => !prev)}>
        <ThemedText>
          {selected ? values[selected].name : placeholder}
        </ThemedText>
        {open && (
          <View>
            {values.map((option, index) => {
              return (
                <Pressable
                  onPress={() => {
                    if (selected === index) return;
                    onValuesChange(option);
                  }}
                  style={[styles.option]}
                >
                  <ThemedText
                    style={[
                      styles.optionText,
                      { color: selected === index ? "lime" : "gray" },
                    ]}
                  >
                    {option.name}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        )}
      </Pressable>
    </>
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
  contentContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    width: "100%",
    paddingVertical: 48,
  },
  option: {},
  optionText: {},
});
