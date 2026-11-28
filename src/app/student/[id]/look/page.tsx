"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, Dices } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Coin } from "@/components/ui/Coin";
import { Toast } from "@/components/ui/Feedback";
import { SuccessSparkle } from "@/components/SuccessSparkle";
import { AvatarHead, AvatarPicture } from "@/components/room/RoomArt";
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, SHIRT_COLORS, SKIN_TONES, lookOf, randomLook, type AvatarLook } from "@/lib/avatar";
import { buyAccessory, getStudent, setLook, wearAccessory } from "@/lib/store";
import { useStore } from "@/lib/useStore";

/** A round colour you can tap */
function Swatch({ color, on, label, onClick }: { color: string; on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={on}
      className={`w-12 h-12 rounded-full border-2 border-ink transition-transform hover:scale-110 flex items-center justify-center ${
        on ? "ring-4 ring-periwinkle ring-offset-2 ring-offset-surface scale-110" : ""
      }`}
      style={{ background: color }}
    >
      {on && <Check className="w-5 h-5" strokeWidth={3} />}
    </button>
  );
}

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 className="font-display text-2xl tracking-tight">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export default function MyLookPage() {
  const params = useParams();
  const studentId = params.id as string;
  useStore();
  const [cheer, setCheer] = useState(0);
  const [message, setMessage] = useState("");
  const [sparkle, setSparkle] = useState(false);

  const student = getStudent(studentId);
  if (!student) return null;
  const look = lookOf(student);
  const owned = student.accessories ?? [];

  const change = (changes: Partial<AvatarLook>) => setLook(studentId, changes);
  const flash = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage((m) => (m === msg ? "" : m)), 2600);
  };

  return (
    <div>
      <header className="mb-8">
        <p className="font-display text-lg text-muted mb-1">My look</p>
        <h1 className="display text-[40px] md:text-[52px] leading-none">Make your character</h1>
        <p className="text-lg text-ink-soft mt-3">Tap to choose. Your character shows up on your home page and in your room.</p>
      </header>

      <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start">
        {/* Preview */}
        <div className="md:sticky md:top-8">
          <Card className="p-6 flex flex-col items-center">
            <div className="w-full rounded-3xl bg-periwinkle-soft flex items-end justify-center pt-8 pb-4">
              <AvatarPicture key={cheer} look={look} mood={cheer ? "cheer" : "wave"} className="h-56 w-auto" />
            </div>
            <p className="font-display text-2xl mt-4">{student.name}</p>
            <div className="flex gap-2 mt-4 w-full">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  change(randomLook(look));
                  setCheer((n) => n + 1);
                }}
              >
                <Dices className="w-4 h-4" /> Surprise me
              </Button>
            </div>
            <Link href={`/student/${studentId}`} className="w-full mt-2">
              <Button fullWidth>Done</Button>
            </Link>
          </Card>
        </div>

        {/* Choices */}
        <Card className="p-6 md:p-8 space-y-9">
          <Section title="Skin">
            <div className="flex flex-wrap gap-3">
              {SKIN_TONES.map((c, i) => (
                <Swatch key={c} color={c} on={look.skin === c} label={`Skin tone ${i + 1}`} onClick={() => change({ skin: c })} />
              ))}
            </div>
          </Section>

          <Section title="Hair">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {HAIR_STYLES.map((h) => {
                const on = look.hair === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => change({ hair: h.id })}
                    aria-pressed={on}
                    className={`rounded-2xl border-2 p-2 pb-1.5 flex flex-col items-center transition-colors ${
                      on ? "border-ink bg-paper" : "border-line hover:border-ink-soft"
                    }`}
                  >
                    <AvatarHead look={{ ...look, hair: h.id, accessory: null }} className="w-14 h-auto" />
                    <span className="text-sm mt-1">{h.name}</span>
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Hair colour">
            <div className="flex flex-wrap gap-3">
              {HAIR_COLORS.map((c, i) => (
                <Swatch key={c} color={c} on={look.hairColor === c} label={`Hair colour ${i + 1}`} onClick={() => change({ hairColor: c })} />
              ))}
            </div>
          </Section>

          <Section title="Shirt">
            <div className="flex flex-wrap gap-3">
              {SHIRT_COLORS.map((c, i) => (
                <Swatch key={c} color={c} on={look.shirt === c} label={`Shirt colour ${i + 1}`} onClick={() => change({ shirt: c })} />
              ))}
            </div>
          </Section>

          <Section
            title="Extras"
            aside={
              <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
                <Coin type="spend" size={20} />
                <span className="num">{student.spendTokens}</span> Spend tokens
              </span>
            }
          >
            <p className="text-ink-soft -mt-1 mb-4 text-[15px]">Buy one with Spend tokens. Once it&apos;s yours, you can put it on or take it off any time.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => wearAccessory(studentId, null)}
                aria-pressed={!look.accessory}
                className={`rounded-2xl border-2 p-3 flex flex-col items-center transition-colors ${
                  !look.accessory ? "border-ink bg-paper" : "border-line hover:border-ink-soft"
                }`}
              >
                <AvatarHead look={{ ...look, accessory: null }} className="w-16 h-auto" />
                <span className="text-sm font-medium mt-1">Nothing</span>
                <span className="text-xs text-muted mt-1 h-8 flex items-center">{!look.accessory ? "Wearing" : "Take it off"}</span>
              </button>
              {ACCESSORIES.map((a) => {
                const has = owned.includes(a.id);
                const wearing = look.accessory === a.id;
                const canAfford = student.spendTokens >= a.cost;
                return (
                  <div
                    key={a.id}
                    className={`rounded-2xl border-2 p-3 flex flex-col items-center ${wearing ? "border-ink bg-paper" : "border-line"}`}
                  >
                    <AvatarHead look={{ ...look, accessory: a.id }} className="w-16 h-auto" />
                    <span className="text-sm font-medium mt-1 text-center">{a.name}</span>
                    <div className="mt-1 h-8 flex items-center">
                      {wearing ? (
                        <span className="text-xs text-muted inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Wearing
                        </span>
                      ) : has ? (
                        <Button size="sm" variant="secondary" onClick={() => wearAccessory(studentId, a.id)}>
                          Put on
                        </Button>
                      ) : canAfford ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            if (buyAccessory(studentId, a.id)) {
                              setSparkle(true);
                              setCheer((n) => n + 1);
                              flash(`You got the ${a.name}!`);
                            }
                          }}
                        >
                          <Coin type="spend" size={16} /> {a.cost}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted num">{a.cost - student.spendTokens} more tokens</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        </Card>
      </div>

      <SuccessSparkle show={sparkle} onComplete={() => setSparkle(false)} />
      <Toast message={message} />
    </div>
  );
}
