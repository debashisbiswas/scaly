import { useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TopBar from "./components/TopBar";

const SHARP_KEYS = ["G", "D", "A", "E", "B"];
const FLAT_KEYS = ["F", "Bb", "Eb", "Ab", "Db"];

function NoteButton({
  note,
  selected,
  onPress,
}: {
  note: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        aspectRatio: 1,
        borderWidth: 1,
        borderColor: "#000",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: selected ? "#000" : "#fff",
      }}
    >
      <Text
        style={{
          fontWeight: "600",
          color: selected ? "#fff" : "#000",
        }}
      >
        {note}
      </Text>
    </Pressable>
  );
}

export default function ChooseKey() {
  const router = useRouter();
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());

  const toggleNote = (note: string) => {
    setSelectedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(note)) {
        next.delete(note);
      } else {
        next.add(note);
      }
      return next;
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar
        title="Choose your keys"
        subtitle="Select all that apply"
        onBack={() => router.back()}
        onNext={() => router.navigate("/choose-instrument")}
      />

      {/* Notes Grid */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: 16,
          gap: 8,
        }}
      >
        {/* Top row: C + 5 sharps + F#/Gb */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <NoteButton
            note="C"
            selected={selectedNotes.has("C")}
            onPress={() => toggleNote("C")}
          />
          {SHARP_KEYS.map((note) => (
            <NoteButton
              key={note}
              note={note}
              selected={selectedNotes.has(note)}
              onPress={() => toggleNote(note)}
            />
          ))}
          <NoteButton
            note="F#/Gb"
            selected={selectedNotes.has("F#/Gb")}
            onPress={() => toggleNote("F#/Gb")}
          />
        </View>

        {/* Bottom row: spacer + 5 flats + spacer */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }} />
          {FLAT_KEYS.map((note) => (
            <NoteButton
              key={note}
              note={note}
              selected={selectedNotes.has(note)}
              onPress={() => toggleNote(note)}
            />
          ))}
          <View style={{ flex: 1 }} />
        </View>

        {/* Select All Button */}
        <Pressable
          onPress={() => {
            const allNotes = ["C", ...SHARP_KEYS, "F#/Gb", ...FLAT_KEYS];
            const allSelected = allNotes.every((note) =>
              selectedNotes.has(note),
            );
            setSelectedNotes(allSelected ? new Set() : new Set(allNotes));
          }}
          style={{
            marginTop: 16,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderWidth: 1,
            borderColor: "#000",
            borderRadius: 8,
            alignSelf: "center",
          }}
        >
          <Text style={{ fontWeight: "600" }}>Select All</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
